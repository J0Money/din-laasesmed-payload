import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '../src/payload.config.js'
import { extractVideos, injectVideoBlocks } from './lib/webflowVideos.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(dirname, '../data/webflow-export')

type Row = Record<string, string>

function readCsv(file: string): Row[] {
  const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')
  return parse(content, { columns: true, relax_quotes: true, skip_empty_lines: true })
}

function emptyLexicalState() {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '(Indhold mangler — udfyld manuelt)',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

function isPublished(row: Row): 'draft' | 'published' {
  return row.Draft === 'true' ? 'draft' : 'published'
}

async function run() {
  const payload = await getPayload({ config })
  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function htmlToLexical(html: string | undefined): any {
    if (!html || !html.trim()) return emptyLexicalState()
    try {
      const { html: withMarkers, videos } = extractVideos(html)
      return injectVideoBlocks(convertHTMLToLexical({ editorConfig, html: withMarkers, JSDOM }), videos)
    } catch (err) {
      console.warn(`  ⚠ Kunne ikke konvertere rich text, bruger tom tekst: ${(err as Error).message}`)
      return emptyLexicalState()
    }
  }

  const mediaCache = new Map<string, string>()

  async function uploadImageFromUrl(url: string | undefined, alt: string): Promise<string | undefined> {
    if (!url || !url.trim()) return undefined
    const cached = mediaCache.get(url)
    if (cached) return cached

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'image.jpg')
      const mimetype = res.headers.get('content-type') || 'image/jpeg'

      const doc = await payload.create({
        collection: 'media',
        data: { alt: alt || filename },
        file: {
          name: filename,
          data: buffer,
          mimetype,
          size: buffer.length,
        },
      })
      const id = String(doc.id)
      mediaCache.set(url, id)
      return id
    } catch (err) {
      console.warn(`  ⚠ Kunne ikke hente billede ${url}: ${(err as Error).message}`)
      return undefined
    }
  }

  // ---- Categories ----
  console.log('Importerer categories...')
  const categoriesCsv = readCsv('categories.csv')
  const categoryIdByName = new Map<string, string>()

  for (const row of categoriesCsv) {
    const doc = await payload.create({
      collection: 'categories',
      data: {
        name: row.Name,
        slug: row.Slug,
        mainHeading: row['Main heading'] || row.Name,
        mainText: htmlToLexical(row['Main text']),
        titleTag: row['Title tag'] || undefined,
        metaDescription: row['Meta description'] || undefined,
        _status: isPublished(row),
      },
    })
    categoryIdByName.set(row.Name, String(doc.id))
    console.log(`  ✓ ${row.Name}`)
  }

  // ---- Brands ----
  console.log('Importerer brands...')
  const brandsCsv = readCsv('brands.csv')
  const brandIdBySlug = new Map<string, string>()

  for (const row of brandsCsv) {
    const logo = await uploadImageFromUrl(row.Logo, `${row.Name} logo`)
    const mainImage = await uploadImageFromUrl(row['Main image'], row['Main alt text'] || row.Name)

    const accordion: Array<{
      image: string | undefined
      text: ReturnType<typeof htmlToLexical>
      title: string | undefined
    }> = []
    for (let i = 1; i <= 4; i++) {
      const title = row[`Collapse ${i} title`]
      const imageUrl = row[`Collapse ${i} image`]
      const text = row[`Collapse ${i} text`]
      if (title || imageUrl || text) {
        accordion.push({
          title: title || undefined,
          image: await uploadImageFromUrl(imageUrl, title || row.Name),
          text: htmlToLexical(text),
        })
      }
    }

    const doc = await payload.create({
      collection: 'brands',
      data: {
        name: row.Name,
        slug: row.Slug,
        logo,
        mainImage,
        mainAlt: row['Main alt text'] || undefined,
        mainHeading: row['Main heading'] || row.Name,
        mainText: htmlToLexical(row['Main text']),
        accordion: accordion.length ? accordion : undefined,
        _status: isPublished(row),
      },
    })
    brandIdBySlug.set(row.Slug, String(doc.id))
    console.log(`  ✓ ${row.Name}`)
  }

  // ---- Articles ----
  console.log('Importerer articles...')
  const articlesCsv = readCsv('articles.csv')

  for (const row of articlesCsv) {
    const mainImage = await uploadImageFromUrl(row['Main image'], row['Main heading'] || row.Name)
    const categoryId = categoryIdByName.get(row.Category)
    const brandSlugs = (row.Brands || '')
      .split(';')
      .map((slug) => slug.trim())
      .filter(Boolean)
    const brandIds = brandSlugs
      .map((slug) => brandIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))

    await payload.create({
      collection: 'articles',
      data: {
        name: row.Name,
        slug: row.Slug,
        category: categoryId,
        mainImage,
        mainHeading: row['Main heading'] || row.Name,
        mainText: htmlToLexical(row['Main text']),
        brands: brandIds.length ? brandIds : undefined,
        titleTag: row['Title tag'] || undefined,
        metaDescription: row['Meta description'] || undefined,
        // Webflows datoer bevares, da "Læs også" sorterer efter dem.
        publishedAt: row['Published On'] ? new Date(row['Published On']).toISOString() : undefined,
        createdAt: row['Created On'] ? new Date(row['Created On']).toISOString() : undefined,
        _status: isPublished(row),
      },
    })
    console.log(`  ✓ ${row.Name}`)
  }

  // ---- Employees ----
  console.log('Importerer employees...')
  const employeesCsv = readCsv('employees.csv')
  const typeMap: Record<string, 'aalborg' | 'administration' | 'montoerer'> = {
    Aalborg: 'aalborg',
    Administration: 'administration',
    'Montører': 'montoerer',
  }

  for (const row of employeesCsv) {
    const photo = await uploadImageFromUrl(row.Photo, row.Name)

    await payload.create({
      collection: 'employees',
      data: {
        name: row.Name,
        slug: row.Slug,
        title: row.Title || undefined,
        mail: row.Mail || undefined,
        phone: row.Phone || undefined,
        type: typeMap[row.Type],
        photo,
        showImage: row['Show image'] === 'true',
      },
    })
    console.log(`  ✓ ${row.Name}`)
  }

  console.log('\nFærdig! Alt indhold fra Webflow er importeret.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
