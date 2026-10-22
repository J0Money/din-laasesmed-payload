import Link from 'next/link'

import { resolveLinkHref } from '@/lib/link'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

import { LinkedInIcon, MailIcon, PhoneIcon, StoreIcon } from './FooterIcons'
import { NAV_ICON_BY_CATEGORY_SLUG } from './NavIcons'

const FOOTER_CATEGORY_SLUGS = ['mekanisk-sikring', 'elektronisk-sikring', 'service']

const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-trim my-[10px] font-heading text-[19.2px] font-medium text-ink-muted">{children}</h2>
  )
}

function FooterLine({ children, href, icon }: { children: React.ReactNode; href?: string; icon: React.ReactNode }) {
  const content = (
    <>
      {icon}
      <span className="text-sm leading-[21px]">{children}</span>
    </>
  )
  return href ? (
    <a href={href} className="flex items-center gap-2 transition-colors duration-200 hover:text-brand-500">
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-2">{content}</div>
  )
}

/** Mål aflæst fra footer.footer på din-laasesmed.dk (1600px viewport). */
export async function Footer() {
  const payload = await getPayloadClient()
  const [footer, siteSettings, categories] = await Promise.all([
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'siteSettings' }),
    payload.find({ collection: 'categories', where: { slug: { in: FOOTER_CATEGORY_SLUGS } }, limit: 10 }),
  ])

  const categoriesWithArticles = await Promise.all(
    categories.docs.map(async (category) => {
      const articles = await payload.find({
        collection: 'articles',
        where: { category: { equals: category.id }, _status: { equals: 'published' } },
        limit: 100,
        depth: 0,
      })
      // Som originalen: de første 6 alfabetisk, uden forskel på store/små bogstaver ("iLOQ" under i).
      const sorted = [...articles.docs].sort((a, b) => a.name.localeCompare(b.name, 'da', { sensitivity: 'base' }))
      return { category, articles: sorted.slice(0, 6) }
    }),
  )
  categoriesWithArticles.sort(
    (a, b) => FOOTER_CATEGORY_SLUGS.indexOf(a.category.slug) - FOOTER_CATEGORY_SLUGS.indexOf(b.category.slug),
  )

  const certificationLogo = mediaUrl(siteSettings.certificationLogo)

  return (
    <footer>
      <div className="bg-ink-800 py-28 text-[#f2f5f9]">
        <div className="site-container flex flex-col gap-20 lg:flex-row">
          {/* De to første kolonner er indholds-brede som på originalen (ikke faste bredder). */}
          <div className="flex shrink-0 flex-col gap-6">
            <FooterHeading>Brug for hjælp?</FooterHeading>
            <div className="flex flex-col gap-1">
              {siteSettings.phone && (
                <FooterLine href={telHref(siteSettings.phone)} icon={<PhoneIcon />}>
                  {siteSettings.phone}
                </FooterLine>
              )}
              {siteSettings.email && (
                <FooterLine href={`mailto:${siteSettings.email}`} icon={<MailIcon />}>
                  {siteSettings.email}
                </FooterLine>
              )}
            </div>

            {siteSettings.openingHours && siteSettings.openingHours.length > 0 && (
              <>
                <FooterHeading>Åbningstider</FooterHeading>
                <ul className="flex flex-col gap-1 text-sm leading-[21px]">
                  {siteSettings.openingHours.map((row, index) => (
                    <li key={row.id ?? index} className="flex justify-between">
                      <span>{row.label}:</span>
                      <span>{row.hours}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="flex flex-col gap-5">
              {certificationLogo && (
                <img
                  src={certificationLogo}
                  alt={mediaAlt(siteSettings.certificationLogo)}
                  loading="lazy"
                  className="h-auto w-[55px]"
                />
              )}
              {siteSettings.linkedin && (
                <div className="flex gap-4">
                  <a href={siteSettings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors duration-200 hover:text-brand-500">
                    <LinkedInIcon />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-6">
            {(siteSettings.departments ?? []).map((department, index) => (
              <div key={department.id ?? index} className="flex flex-col gap-6">
                <FooterHeading>{department.name}</FooterHeading>
                <FooterLine icon={<StoreIcon />}>{department.address}</FooterLine>
                <div className="flex flex-col gap-1">
                  <FooterLine href={telHref(department.phone)} icon={<PhoneIcon />}>
                    {department.phone}
                  </FooterLine>
                  {department.email && (
                    <FooterLine href={`mailto:${department.email}`} icon={<MailIcon />}>
                      {department.email}
                    </FooterLine>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-12 md:flex-row">
            {categoriesWithArticles.map(({ category, articles }) => {
              const Icon = NAV_ICON_BY_CATEGORY_SLUG[category.slug]
              return (
                <div key={category.id} className="flex min-w-0 flex-1 flex-col gap-6">
                  <FooterHeading>{category.name}</FooterHeading>
                  <ul className="flex flex-col gap-2">
                    {articles.map((article) => (
                      <li key={article.id}>
                        <Link href={ROUTES.article(article.slug)} className="flex items-center gap-2 transition-colors duration-200 hover:text-brand-500">
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="line-clamp-1 text-sm leading-[21px]">{article.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-ink-900 py-8 text-xs leading-[18px] text-ink-muted">
        <div className="site-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-12">
            <p>
              {siteSettings.companyName || 'Din Låsesmed A/S'} © {new Date().getFullYear()}
            </p>
            {siteSettings.cvr && <p>CVR: {siteSettings.cvr}</p>}
          </div>
          <nav className="flex flex-wrap gap-8">
            {(footer.links ?? []).map((item, index) => (
              <Link
                key={item.id ?? index}
                href={resolveLinkHref(item.link)}
                target={item.link?.newTab ? '_blank' : undefined}
                rel={item.link?.newTab ? 'noopener noreferrer' : undefined}
                className="hover:text-brand-500 hover:underline"
              >
                {item.link?.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
