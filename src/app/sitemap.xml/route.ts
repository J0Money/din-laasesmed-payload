import { getPayloadClient } from '@/lib/payload'
import { HOME_PAGE_SLUG, ROUTES } from '@/lib/routes'
import { SITE_URL } from '@/lib/seo'

// Sitemap bygges af databasen på hver forespørgsel (Railways build kan ikke nå databasen).
export const dynamic = 'force-dynamic'

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function GET() {
  const payload = await getPayloadClient()
  const published = { _status: { equals: 'published' } } as const
  const find = (collection: 'pages' | 'articles' | 'brands' | 'categories') =>
    payload.find({ collection, where: published, limit: 1000, depth: 0, pagination: false })

  const [pages, articles, brands, categories] = await Promise.all([
    find('pages'),
    find('articles'),
    find('brands'),
    find('categories'),
  ])

  const entries: { lastmod?: string; path: string }[] = []
  const add = (docs: { sitemapIndexing?: boolean | null; updatedAt?: string }[], toPath: (slug: string) => string) => {
    for (const doc of docs as { slug: string; sitemapIndexing?: boolean | null; updatedAt?: string }[]) {
      if (doc.sitemapIndexing === false) continue
      entries.push({ path: toPath(doc.slug), lastmod: doc.updatedAt })
    }
  }
  add(pages.docs, (slug) => (slug === HOME_PAGE_SLUG ? ROUTES.home() : ROUTES.page(slug)))
  add(articles.docs, ROUTES.article)
  add(brands.docs, ROUTES.brand)
  add(categories.docs, ROUTES.category)

  const urls = entries
    .map(({ lastmod, path }) => {
      const loc = escapeXml(`${SITE_URL}${path === '/' ? '' : path}`)
      return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
