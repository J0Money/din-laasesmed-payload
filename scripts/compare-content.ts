// Skrivebeskyttet: sammenligner din-laasesmed.dk (sitemap + hver artikel) med indholdet i databasen og skriver en rapport.
// Kør: node --env-file=.env.local --import tsx scripts/compare-content.ts
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

const ORIGIN = 'https://din-laasesmed.dk'

const norm = (s: string) => s.replace(/[​-‍ ]/g, ' ').replace(/\s+/g, ' ').trim()

/* eslint-disable @typescript-eslint/no-explicit-any */
function lexicalText(node: any): string {
  if (!node) return ''
  const n = node.root ?? node
  if (typeof n.text === 'string') return n.text
  const inner = (n.children ?? []).map(lexicalText)
  // Blokke på øverste niveau adskilles med mellemrum, så "...tekst.</p><p>Næste" ikke klistres sammen.
  return n.type === 'root' || n.type === 'list' ? inner.join(' ') : n.type === 'paragraph' || n.type === 'heading' || n.type === 'listitem' ? inner.join('') + ' ' : inner.join('')
}

async function get(url: string) {
  const res = await fetch(url)
  return { status: res.status, text: res.ok ? await res.text() : '', finalUrl: res.url }
}

async function run() {
  const payload = await getPayload({ config })

  const sitemap = await get(`${ORIGIN}/sitemap.xml`)
  const urls = [...sitemap.text.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, '') || '/')
  const live = { articles: new Set<string>(), categories: new Set<string>(), brands: new Set<string>(), pages: new Set<string>() }
  for (const url of urls) {
    const [, first, second] = url.split('/')
    if (first === 'artikler' && second) live.articles.add(second)
    else if (first === 'overview' && second) live.categories.add(second)
    else if (first === 'brands' && second) live.brands.add(second)
    else live.pages.add(first || '')
  }

  const [articles, categories, brands, pages] = await Promise.all([
    payload.find({ collection: 'articles', limit: 500, depth: 0, draft: true }),
    payload.find({ collection: 'categories', limit: 100, depth: 0, draft: true }),
    payload.find({ collection: 'brands', limit: 100, depth: 0, draft: true }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, draft: true }),
  ])
  const ours = {
    articles: new Map((articles.docs as any[]).map((d) => [d.slug, d])),
    categories: new Map((categories.docs as any[]).map((d) => [d.slug, d])),
    brands: new Map((brands.docs as any[]).map((d) => [d.slug, d])),
    pages: new Map((pages.docs as any[]).map((d) => [d.slug === 'forside' ? '' : d.slug, d])),
  }

  console.log(`Sitemap: ${urls.length} adresser (${live.articles.size} artikler, ${live.categories.size} kategorier, ${live.brands.size} mærker, ${live.pages.size} sider)\n`)

  for (const kind of ['articles', 'categories', 'brands', 'pages'] as const) {
    const onlyLive = [...live[kind]].filter((slug) => !ours[kind].has(slug))
    const onlyOurs = [...ours[kind].keys()].filter((slug) => !live[kind].has(slug))
    console.log(`== ${kind}: kun på originalen: ${onlyLive.join(', ') || '-'}`)
    console.log(`== ${kind}: kun hos os: ${onlyOurs.map((s) => `${s || '(forside)'}${(ours[kind].get(s) as any)?._status === 'draft' ? ' [kladde]' : ''}`).join(', ') || '-'}\n`)
  }

  console.log('--- Artikler, indhold: forskelle mod originalen ---')
  let same = 0
  for (const slug of [...live.articles].filter((s) => ours.articles.has(s))) {
    const ourDoc: any = ours.articles.get(slug)
    const page = await get(`${ORIGIN}/artikler/${slug}`)
    if (page.status !== 200) {
      console.log(`${slug}: originalen svarer ${page.status}`)
      continue
    }
    const doc = new JSDOM(page.text).window.document
    const diffs: string[] = []
    const title = norm(doc.querySelector('title')?.textContent ?? '')
    const desc = norm(doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '')
    const h1 = norm(doc.querySelector('.article_main_heading')?.textContent ?? '')
    const liveText = norm(doc.querySelector('.article_main_text .w-richtext')?.textContent ?? '')
    const ourText = norm(lexicalText(ourDoc.mainText))
    if (title !== norm(ourDoc.titleTag ?? '')) diffs.push(`title: live "${title.slice(0, 60)}" / vores "${norm(ourDoc.titleTag ?? '').slice(0, 60)}"`)
    if (desc !== norm(ourDoc.metaDescription ?? '')) diffs.push(`description ændret (${desc.length} / ${norm(ourDoc.metaDescription ?? '').length} tegn)`)
    if (h1 !== norm(ourDoc.mainHeading ?? '')) diffs.push(`overskrift: live "${h1}" / vores "${norm(ourDoc.mainHeading ?? '')}"`)
    // Uden mellemrum, så forskelle i hvordan afsnit og lister samles ikke tæller; kun faktisk andre ord.
    const squash = (s: string) => s.replace(/\s+/g, '')
    const a = squash(liveText)
    const b = squash(ourText)
    if (a !== b) {
      let i = 0
      while (i < a.length && i < b.length && a[i] === b[i]) i++
      diffs.push(
        `tekst afviger ved tegn ${i} af ${a.length}/${b.length}: live "…${a.slice(Math.max(0, i - 25), i + 50)}" / vores "…${b.slice(Math.max(0, i - 25), i + 50)}"`,
      )
    }
    if (ourDoc._status === 'draft') diffs.push('vores artikel er KLADDE')

    // Hovedbillede: originalens filnavn (uden CDN-mappen) skal indgå i vores medie-fil.
    const liveImg = decodeURIComponent((doc.querySelector('.article_main_image')?.getAttribute('src') ?? '').split('/').pop() ?? '').replace(/\s+/g, '-')
    const ourImg = ourDoc.mainImage ? (await payload.findByID({ collection: 'media', id: ourDoc.mainImage, depth: 0 }).catch(() => null)) : null
    const ourName = decodeURIComponent((ourImg as any)?.filename ?? '').replace(/\s+/g, '-')
    if (liveImg && !ourName.includes(liveImg.replace(/^[0-9a-f]{24}_/, '')) && !ourName.includes(liveImg)) diffs.push(`billede: live "${liveImg.slice(-45)}" / vores "${ourName.slice(-45)}"`)

    if (diffs.length) console.log(`${slug}:\n   - ${diffs.join('\n   - ')}`)
    else same++
  }
  console.log(`\n${same} artikler er helt ens (titel, beskrivelse, overskrift, tekst, billede).`)

  // Kategorier: artiklerne på originalens kategoriside mod de udgivne artikler vi har i kategorien.
  console.log('\n--- Kategorisider: hvilke artikler står hvor ---')
  for (const category of categories.docs as any[]) {
    const page = await get(`${ORIGIN}/overview/${category.slug}`)
    if (page.status !== 200) {
      console.log(`${category.slug}: originalen svarer ${page.status}`)
      continue
    }
    const doc = new JSDOM(page.text).window.document
    const liveSlugs = new Set(
      [...doc.querySelectorAll('main a[href^="/artikler/"], .overview_items a[href^="/artikler/"]')]
        .filter((a) => !a.closest('header, footer, nav, [class*="mega"]'))
        .map((a) => a.getAttribute('href')!.split('/')[2]),
    )
    const ourSlugs = new Set(
      (articles.docs as any[]).filter((a) => a.category === category.id && a._status === 'published').map((a) => a.slug),
    )
    const missingHere = [...liveSlugs].filter((s) => !ourSlugs.has(s))
    const extraHere = [...ourSlugs].filter((s) => !liveSlugs.has(s))
    console.log(`${category.slug}: original ${liveSlugs.size}, vores ${ourSlugs.size} | kun på originalen: ${missingHere.join(', ') || '-'} | kun hos os: ${extraHere.join(', ') || '-'}`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
