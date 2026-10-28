// Opretter faste sider som Payload-sider af blokke, med tekster, billeder, videoer og SEO hentet fra din-laasesmed.dk.
// Overskriver aldrig en side, der allerede findes (så siderne kan rettes i admin uden at blive nulstillet).
// Kør: node --env-file=.env.local --import tsx scripts/seed-pages.ts [slug ...]
import { convertHTMLToLexical, defaultEditorConfig, sanitizeServerEditorConfig } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../src/payload.config.js'
import { extractVideos, injectVideoBlocks } from './lib/webflowVideos.js'

const ORIGIN = 'https://din-laasesmed.dk'

type PageSpec = {
  slug: string
  title: string
  kind: 'about' | 'article' | 'brands' | 'contact' | 'intro' | 'thanks' | 'videoArticle'
}

const PAGES: PageSpec[] = [
  { slug: 'kontakt', title: 'Kontakt', kind: 'contact' },
  { slug: 'laasesmed-aalborg', title: 'Låsesmed Aalborg', kind: 'contact' },
  { slug: 'om-os', title: 'Om os', kind: 'about' },
  { slug: 'brands', title: 'Mærker', kind: 'brands' },
  { slug: 'formular', title: 'Formular', kind: 'article' },
  { slug: 'cookie-og-privatlivspolitik', title: 'Cookie- og privatlivspolitik', kind: 'article' },
  { slug: 'ledige-stillinger', title: 'Ledige stillinger', kind: 'intro' },
  { slug: 'tak-for-din-henvendelse', title: 'Tak for din henvendelse', kind: 'thanks' },
]

const MIME: Record<string, string> = {
  avif: 'image/avif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  webm: 'video/webm',
  mp4: 'video/mp4',
}

async function run() {
  const only = process.argv.slice(2)
  const payload = await getPayload({ config })
  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function htmlToLexical(html: string): any {
    const { html: withMarkers, videos } = extractVideos(html)
    return injectVideoBlocks(convertHTMLToLexical({ editorConfig, html: withMarkers, JSDOM }), videos)
  }

  /** Henter en fil fra originalen og gemmer den i media/videos, medmindre en med samme grundnavn allerede findes. */
  async function uploadFrom(collection: 'media' | 'videos', url: string, alt: string, name?: string): Promise<string> {
    const decoded = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? 'fil')
    const filename = (name ?? decoded).replace(/\s+/g, '-')
    const stem = path.parse(filename).name
    // Hele filnavnet, ikke kun grundnavnet: "butik.mp4" må ikke genbruge "butik.webm".
    const existing = await payload.find({ collection, where: { filename: { contains: filename } }, limit: 1, depth: 0 })
    if (existing.docs[0]) return String(existing.docs[0].id)

    const res = await fetch(url)
    if (!res.ok) throw new Error(`${url}: ${res.status}`)
    const data = Buffer.from(await res.arrayBuffer())
    const mimetype = MIME[path.extname(filename).slice(1).toLowerCase()] ?? 'application/octet-stream'
    const doc = await payload.create({
      collection,
      data: collection === 'media' ? { alt: alt || stem } : {},
      file: { name: filename, data, mimetype, size: data.length },
    })
    console.log(`    uploadet ${collection}: ${filename}`)
    return String(doc.id)
  }

  for (const spec of PAGES) {
    if (only.length && !only.includes(spec.slug)) continue

    const exists = await payload.find({ collection: 'pages', where: { slug: { equals: spec.slug } }, limit: 1, draft: true })
    if (exists.docs[0]) {
      console.log(`- ${spec.slug}: findes allerede, springes over`)
      continue
    }

    console.log(`- ${spec.slug}`)
    const res = await fetch(`${ORIGIN}/${spec.slug}`)
    if (!res.ok) throw new Error(`${spec.slug}: ${res.status}`)
    const doc = new JSDOM(await res.text()).window.document
    const text = (selector: string) => doc.querySelector(selector)?.textContent?.trim() ?? ''
    const html = (selector: string) => doc.querySelector(selector)?.innerHTML ?? ''
    const attr = (selector: string, name: string) => doc.querySelector(selector)?.getAttribute(name) ?? ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layout: any[] = []

    const internal = (href: string) => href.replace(ORIGIN, '') || '/'

    if (spec.kind === 'videoArticle' || spec.kind === 'contact' || spec.kind === 'about') {
      const poster = attr('.hero_video_placeholder', 'src')
      const sources = [...doc.querySelectorAll('.video_hero video source')].map((s) => s.getAttribute('src') ?? '')
      const webm = sources.find((s) => s.endsWith('.webm'))
      const mp4 = sources.find((s) => s.endsWith('.mp4'))
      const isShop = (webm ?? mp4 ?? '').includes('butik')
      layout.push({
        blockType: 'videoHero',
        poster: await uploadFrom('media', poster, attr('.hero_video_placeholder', 'alt') || 'Butik reception'),
        videoWebm: webm ? await uploadFrom('videos', webm, '', isShop ? 'butik.webm' : undefined) : undefined,
        videoMp4: mp4 ? await uploadFrom('videos', mp4, '', isShop ? 'butik.mp4' : undefined) : undefined,
      })
    }

    if (spec.kind === 'contact') {
      // Kortene står i fast rækkefølge på originalen: ring, butik, mail, certifikat; det første har den udfyldte knap.
      const ICONS = ['phone', 'shop', 'mail', 'certificate']
      const cards = [...doc.querySelectorAll('.contact_cards .contact_card')].map((card, index) => {
        const cta = card.querySelector('a.contact_focus_cta')
        return {
          icon: ICONS[index] ?? 'phone',
          text: card.querySelector('.contact_card_text')?.textContent?.trim() ?? '',
          filled: index === 0,
          link: {
            type: 'custom',
            label: card.querySelector('.contact_cta_text')?.textContent?.trim() ?? '',
            url: internal(cta?.getAttribute('href') ?? '#'),
            newTab: cta?.getAttribute('target') === '_blank',
          },
        }
      })
      layout.push({ blockType: 'contactCards', cards })
    }

    if (['article', 'videoArticle', 'contact', 'about'].includes(spec.kind)) {
      const image = attr('.article_main_image', 'src')
      const heading = text('.article_main_heading')
      layout.push({
        blockType: 'articleWithForm',
        image: image ? await uploadFrom('media', image, attr('.article_main_image', 'alt') || heading) : undefined,
        heading,
        content: htmlToLexical(html('.article_main_text .w-richtext')),
        overlapPrevious: spec.kind === 'about',
      })
    }

    if (spec.kind === 'about') {
      const motto = attr('.about_motto_image', 'src')
      const [left, right] = [...doc.querySelectorAll('.about_motto .hero_placeholder_title')].map((e) => e.textContent?.trim() ?? '')
      layout.push({
        blockType: 'parallaxBand',
        image: await uploadFrom('media', motto, 'Din Låsesmed'),
        leftText: left,
        rightText: right,
      })

      const GROUPS: Record<string, string> = { Administration: 'administration', Montører: 'montoerer', Aalborg: 'aalborg' }
      layout.push({
        blockType: 'people',
        groups: [...doc.querySelectorAll('.about_sections_wrapper')].map((section) => {
          const heading = section.querySelector('.about_heading')?.textContent?.trim() ?? ''
          // "Har du brug for hjælp?"-kortet står først i Administration og Aalborg. Webflow sætter det ind med
          // JavaScript i Aalborg, så det kan ikke ses i den hentede HTML.
          return { heading, group: GROUPS[heading], showHelpCard: heading === 'Administration' || heading === 'Aalborg' }
        }),
      })

      const images = []
      for (const img of doc.querySelectorAll('.history_slide img')) {
        images.push({ image: await uploadFrom('media', img.getAttribute('src') ?? '', img.getAttribute('alt') || 'Vores historie') })
      }
      layout.push({ blockType: 'imageSlider', title: text('.history_slider .slide_heading'), images })
    }

    if (spec.kind === 'intro' || spec.kind === 'brands') {
      layout.push({
        blockType: 'overviewIntro',
        tagline: text('.overview_intro .tagline'),
        title: text('.overview_intro h1.heading'),
        heading: text('.overview_intro .article_main_heading'),
        content: htmlToLexical(html('.overview_intro .w-richtext')),
      })
      layout.push(
        spec.kind === 'intro'
          ? { blockType: 'jobList', emptyText: 'Der er ingen ledige stillinger lige nu.' }
          : { blockType: 'brandGrid' },
      )
    }

    if (spec.kind === 'thanks') {
      const image = attr('.thanks_image', 'src')
      const heading = text('.article_thanks_heading')
      layout.push({
        blockType: 'thanksMessage',
        image: image ? await uploadFrom('media', image, attr('.thanks_image', 'alt') || heading) : undefined,
        heading,
        content: htmlToLexical(html('.article_main .w-richtext')),
      })
    }

    const title = doc.querySelector('title')?.textContent?.trim()
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()
    await payload.create({
      collection: 'pages',
      data: {
        title: spec.title,
        slug: spec.slug,
        meta: { title: title || undefined, description: description || undefined },
        layout,
        _status: 'published',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
    console.log(`    side oprettet: ${layout.map((b) => b.blockType).join(', ')} | titel: ${title}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
