import Link from 'next/link'

import { linkArticle, linkCategorySlug, resolveLinkHref } from '@/lib/link'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

import { Logo } from './Logo'
import { GridIcon, NAV_ICON_BY_CATEGORY_SLUG } from './NavIcons'

/** Mål aflæst fra din-laasesmed.dk: topbjælke 38px, hovednav 72px, logo 208px der hænger ud under nav-kanten. */
export async function Header() {
  const payload = await getPayloadClient()
  const [header, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'siteSettings' }),
  ])

  return (
    <header className="relative z-20">
      <div className="bg-ink-900 text-[#ced5e1]">
        <div className="site-container flex h-[38px] items-center justify-between text-[0.9rem]">
          <div className="flex items-center gap-8">
            {siteSettings.phone && (
              <span>
                Ring til{' '}
                <a href={`tel:${siteSettings.phone.replace(/\s/g, '')}`}>
                  {siteSettings.phone}
                </a>
              </span>
            )}
            <span className="flex items-center gap-2 text-[#52a24d]">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#52a24d] opacity-75" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#52a24d]" />
              </span>
              Døgnvagt
            </span>
          </div>

          <nav className="hidden items-center gap-8 font-heading leading-5 tracking-[0.25px] md:flex">
            {(header.utilityLinks ?? []).map((item, index) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id ?? index} className="group relative">
                  <span className="cursor-default">{item.link?.label}</span>
                  <div className="absolute right-0 top-full z-30 hidden min-w-40 flex-col gap-1 rounded-lg bg-white p-2 text-ink-900 shadow-lg group-hover:flex">
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={child.id ?? childIndex}
                        href={resolveLinkHref(child.link)}
                        className="rounded-md px-3 py-2 hover:bg-surface-muted"
                      >
                        {child.link?.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.id ?? index} href={resolveLinkHref(item.link)}>
                  {item.link?.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>

      <div className="h-[72px] border-b-[0.8px] border-[#ced5e1] bg-surface-form text-text-body">
        <div className="site-container flex h-full items-center justify-between">
          {/* Linkboksen er 28px høj; SVG'en er 55px og må gerne hænge ud under nav'en som på originalen. */}
          <Link href={ROUTES.home()} aria-label="Forside" className="block h-7 w-[208px] self-start mt-[21px] text-brand-500">
            <Logo className="h-auto w-[208px] overflow-visible" />
          </Link>

          <div className="flex items-center gap-10">
            <nav className="hidden items-center gap-10 font-heading text-[0.9rem] font-medium md:flex">
              {(header.navItems ?? []).map((item, index) => {
                const Icon = NAV_ICON_BY_CATEGORY_SLUG[linkCategorySlug(item.link) ?? '']
                const categoryHref = resolveLinkHref(item.link)

                return (
                  <div key={item.id ?? index} className="group">
                    <Link href={categoryHref} className="flex items-center gap-3 py-[5px] leading-5 transition-colors duration-200 hover:text-brand-500">
                      {Icon && <Icon />}
                      {item.link?.label}
                    </Link>

                    {/* Mega-menu, mål og lag aflæst fra din-laasesmed.dk (1600px): mørkt bånd i fuld bredde, 5-kolonners grid, ikon = artiklens eget billede.
                        Positioneres relativt til <header> (øverste "relative"-forfader), ikke dette lille nav-punkt — ellers bliver båndet ikke fuld bredde. */}
                    {item.children && item.children.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-30 hidden bg-[rgba(18,23,41,0.9)] py-10 font-sans group-hover:block">
                        <div className="site-container">
                          <p className="mb-[10px] text-[19px] leading-[29px] font-medium text-[#96a1b7]">{item.link?.label}</p>

                          <div className="grid grid-cols-5 gap-x-[38px] gap-y-[30px]">
                            {item.children.map((child, childIndex) => {
                              const article = linkArticle(child.link)
                              const imageUrl = article ? mediaUrl(article.mainImage, 'thumbnail') : undefined

                              return (
                                <Link
                                  key={child.id ?? childIndex}
                                  href={resolveLinkHref(child.link)}
                                  className="flex items-center gap-3 text-[15px] text-[#edf0f3] hover:text-white"
                                >
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt={article ? mediaAlt(article.mainImage) : ''}
                                      className="h-[43px] w-16 shrink-0 rounded-lg object-cover"
                                    />
                                  )}
                                  {child.link?.label}
                                </Link>
                              )
                            })}

                            <Link href={categoryHref} className="button-accent gap-3">
                              <GridIcon />
                              Se alle artikler
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {header.cta?.link?.label && (
              <Link href={resolveLinkHref(header.cta.link)} className="button">
                {header.cta.link.label}
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  )
}
