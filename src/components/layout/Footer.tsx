import Link from 'next/link'

import { resolveLinkHref } from '@/lib/link'
import { getPayloadClient } from '@/lib/payload'

import { NAV_ICON_BY_CATEGORY_SLUG } from './NavIcons'

const FOOTER_CATEGORY_SLUGS = ['mekanisk-sikring', 'elektronisk-sikring', 'service']

export async function Footer() {
  const payload = await getPayloadClient()
  const [footer, siteSettings, categories] = await Promise.all([
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'siteSettings' }),
    payload.find({
      collection: 'categories',
      where: { slug: { in: FOOTER_CATEGORY_SLUGS } },
      limit: 10,
    }),
  ])

  const categoriesWithArticles = await Promise.all(
    categories.docs.map(async (category) => {
      const articles = await payload.find({
        collection: 'articles',
        where: { category: { equals: category.id }, _status: { equals: 'published' } },
        sort: 'name',
        limit: 10,
      })
      return { category, articles: articles.docs }
    }),
  )
  categoriesWithArticles.sort(
    (a, b) =>
      FOOTER_CATEGORY_SLUGS.indexOf(a.category.slug) - FOOTER_CATEGORY_SLUGS.indexOf(b.category.slug),
  )

  return (
    <footer className="mt-24 bg-ink-900 text-[#f2f5f9]">
      <div className="container grid gap-10 py-12 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-medium text-ink-muted">Brug for hjælp?</h2>
            <div className="mt-3 space-y-1">
              {siteSettings.phone && (
                <p>
                  <a href={`tel:${siteSettings.phone.replace(/\s/g, '')}`} className="hover:text-brand-500">
                    {siteSettings.phone}
                  </a>
                </p>
              )}
              {siteSettings.email && (
                <p>
                  <a href={`mailto:${siteSettings.email}`} className="hover:text-brand-500">
                    {siteSettings.email}
                  </a>
                </p>
              )}
            </div>
          </div>

          {siteSettings.openingHours && siteSettings.openingHours.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-ink-muted">Åbningstider</h2>
              <dl className="mt-3 space-y-1 text-sm">
                {siteSettings.openingHours.map((row, index) => (
                  <div key={row.id ?? index} className="flex gap-2">
                    <dt>{row.label}:</dt>
                    <dd>{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {(siteSettings.departments ?? []).map((department, index) => (
            <div key={department.id ?? index}>
              <h2 className="text-lg font-medium text-ink-muted">{department.name}</h2>
              <div className="mt-3 space-y-1 text-sm">
                <p>{department.address}</p>
                <p>
                  <a href={`tel:${department.phone.replace(/\s/g, '')}`} className="hover:text-brand-500">
                    {department.phone}
                  </a>
                </p>
                {department.email && (
                  <p>
                    <a href={`mailto:${department.email}`} className="hover:text-brand-500">
                      {department.email}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container grid gap-8 border-t border-white/10 py-12 md:grid-cols-3">
        {categoriesWithArticles.map(({ category, articles }) => {
          const Icon = NAV_ICON_BY_CATEGORY_SLUG[category.slug as keyof typeof NAV_ICON_BY_CATEGORY_SLUG]
          return (
            <div key={category.id}>
              <h2 className="text-lg font-medium text-ink-muted">{category.name}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/artikler/${article.slug}`}
                      className="flex items-center gap-2 hover:text-brand-500"
                    >
                      {Icon && <Icon />}
                      {article.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-white/60 md:flex-row">
          <p>
            {siteSettings.companyName || 'Din Låsesmed'} © {new Date().getFullYear()}
            {siteSettings.cvr ? ` · CVR: ${siteSettings.cvr}` : ''}
          </p>
          <nav className="flex gap-4">
            {(footer.links ?? []).map((item, index) => (
              <Link key={item.id ?? index} href={resolveLinkHref(item.link)} className="hover:text-white">
                {item.link?.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
