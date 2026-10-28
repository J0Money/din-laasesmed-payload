// Henter artikler, der er kommet på din-laasesmed.dk efter den første import, og retter det, der er ændret:
//  - opretter manglende artikler (tekst, billede, SEO) som udgivne
//  - sætter kategorien Nyheder på de artikler, som originalens /overview/nyheder viser, men som mangler kategori hos os
//  - opdaterer brødteksten på de artikler, der er angivet i REFRESH
// Overskriver ikke andet. Kør: node --env-file=.env.local --import tsx scripts/import-new-articles.ts
import { convertHTMLToLexical, defaultEditorConfig, sanitizeServerEditorConfig } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../src/payload.config.js'
import { extractEmbeds, extractVideos, injectEmbedBlocks, injectVideoBlocks } from './lib/webflowVideos.js'

const ORIGIN = 'https://din-laasesmed.dk'

/** Artikler der mangler hos os. Sitemappet nævner kun Tranbjerg, men alle er på originalen. */
const NEW_SLUGS = [
  'lasesmed-tranbjerg',
  'lasesmed-hjortshoj',
  'lasesmed-harlev',
  'lasesmed-stilling',
  'lasesmed-marslet',
  'lasesmed-malling',
]
/** Artikler hvis brødtekst er ændret på originalen. */
const REFRESH = ['find-lasesmed', 'lasesystemer-til-foreninger']

const MIME: Record<string, string> = { avif: 'image/avif', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

async function dom(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return new JSDOM(await res.text()).window.document
}

async function run() {
  const payload = await getPayload({ config })
  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config)

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const LIST_BREAK = '@@LIST_BREAK@@'
  const toLexical = (html: string): any => {
    const { html: withVideoMarkers, videos } = extractVideos(html)
    const { embeds, html: embedMarked } = extractEmbeds(withVideoMarkers)
    // Konverteren fletter lister, der står lige efter hinanden, til én. En skillelinje holder dem adskilt, og fjernes igen.
    // Et linjeskift lige før et lukkende <a>/<strong> (fx "<a>Titel<br></a>tekst") forsvinder i konverteringen; flyttes ud.
    const brFixed = embedMarked.replace(/<br\s*\/?>((?:\s*<\/(?:a|strong|em|b|i|span)>)+)/g, '$1<br>')
    // To linjeskift sidst i et listepunkt giver en tom linje på originalen; konverteren slår dem sammen til ét. Et
    // usynligt mellemrum (U+200B) efter det første bevarer den tomme linje.
    const blankKept = brFixed.replace(/<br\s*\/?>\s*<br\s*\/?>\s*<\/li>/g, '<br>​</li>')
    const withMarkers = blankKept.replace(/<\/ul>\s*<ul/g, `</ul><p>${LIST_BREAK}</p><ul`)
    const state = injectEmbedBlocks(injectVideoBlocks(convertHTMLToLexical({ editorConfig, html: withMarkers, JSDOM }), videos), embeds)
    state.root.children = state.root.children.filter(
      (node: any) => !(node.type === 'paragraph' && (node.children ?? []).map((c: any) => c.text ?? '').join('') === LIST_BREAK),
    )
    return state
  }

  async function uploadImage(url: string, alt: string): Promise<string> {
    const decoded = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? 'billede')
    const filename = decoded.replace(/\s+/g, '-')
    const existing = await payload.find({ collection: 'media', where: { filename: { contains: filename } }, limit: 1, depth: 0 })
    if (existing.docs[0]) return String(existing.docs[0].id)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${url}: ${res.status}`)
    const data = Buffer.from(await res.arrayBuffer())
    const doc = await payload.create({
      collection: 'media',
      data: { alt: alt || path.parse(filename).name },
      file: { name: filename, data, mimetype: MIME[path.extname(filename).slice(1).toLowerCase()] ?? 'image/avif', size: data.length },
    })
    console.log(`    uploadet billede: ${filename}`)
    return String(doc.id)
  }

  const categories = await payload.find({ collection: 'categories', limit: 20, depth: 0 })
  const nyheder = categories.docs.find((c: any) => c.slug === 'nyheder')
  if (!nyheder) throw new Error('Kategorien Nyheder findes ikke')

  // Hvilke artikler står under Nyheder på originalen, og hvad hedder kortene?
  const overview = await dom(`${ORIGIN}/overview/nyheder`)
  const cardTitle = new Map<string, string>()
  for (const a of overview.querySelectorAll('main a[href^="/artikler/"], .overview_items a[href^="/artikler/"]')) {
    if (a.closest('header, footer, nav, [class*="mega"]')) continue
    const slug = a.getAttribute('href')!.split('/')[2]
    const title = (a.querySelector('h3, h4')?.textContent ?? a.closest('li, .w-dyn-item')?.querySelector('h3, h4')?.textContent ?? '').trim()
    if (!cardTitle.has(slug) || title) cardTitle.set(slug, title)
  }
  console.log(`Nyheder på originalen: ${cardTitle.size} artikler\n`)

  // 1. Nye artikler
  for (const slug of NEW_SLUGS) {
    const exists = await payload.count({ collection: 'articles', where: { slug: { equals: slug } } })
    if (exists.totalDocs) {
      console.log(`- ${slug}: findes allerede, springes over`)
      continue
    }
    const doc = await dom(`${ORIGIN}/artikler/${slug}`)
    const text = (selector: string) => doc.querySelector(selector)?.textContent?.trim() ?? ''
    const title = doc.querySelector('title')?.textContent?.trim() ?? ''
    const heading = text('.article_main_heading')
    const imageEl = doc.querySelector('.article_main_image')
    const imageUrl = imageEl?.getAttribute('src') ?? ''
    const inSitemap = (await (await fetch(`${ORIGIN}/sitemap.xml`)).text()).includes(`/artikler/${slug}`)
    const inNyheder = cardTitle.has(slug)
    const name = (inNyheder && cardTitle.get(slug)) || text('.article_intro_heading') || title.split('|')[0].trim()

    const created = await payload.create({
      collection: 'articles',
      data: {
        name,
        slug,
        mainHeading: heading,
        mainText: toLexical(doc.querySelector('.article_main_text .w-richtext')?.innerHTML ?? ''),
        mainImage: imageUrl ? await uploadImage(imageUrl, imageEl?.getAttribute('alt') || name) : undefined,
        category: inNyheder ? nyheder.id : undefined,
        meta: {
          title: title || undefined,
          description: doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || undefined,
        },
        sitemapIndexing: inSitemap,
        publishedAt: new Date().toISOString(),
        _status: 'published',
      } as any,
    })
    console.log(`- ${slug}: oprettet (id ${created.id}) | navn: "${name}" | h1: "${heading}" | Nyheder: ${inNyheder} | sitemap: ${inSitemap}`)
  }

  // 2. Kategori Nyheder på de artikler, der står der på originalen
  let categorised = 0
  for (const slug of cardTitle.keys()) {
    const found = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })
    const article: any = found.docs[0]
    if (!article || article.category) continue
    await payload.update({ collection: 'articles', id: article.id, data: { category: nyheder.id } as any, draft: false })
    categorised++
  }
  console.log(`\nKategori Nyheder sat på ${categorised} eksisterende artikler`)

  // 3. Opdateret brødtekst
  for (const slug of REFRESH) {
    const found = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })
    const article: any = found.docs[0]
    if (!article) continue
    const doc = await dom(`${ORIGIN}/artikler/${slug}`)
    await payload.update({
      collection: 'articles',
      id: article.id,
      data: { mainText: toLexical(doc.querySelector('.article_main_text .w-richtext')?.innerHTML ?? '') } as any,
      draft: false,
    })
    console.log(`Brødtekst opdateret: ${slug}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
