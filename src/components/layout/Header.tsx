import Link from 'next/link'

import { linkArticle, linkCategorySlug, resolveLinkHref } from '@/lib/link'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

import { CallLink } from './CallLink'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { ChevronDownIcon, GridIcon, NAV_ICON_BY_CATEGORY_SLUG } from './NavIcons'

/** Mål aflæst fra din-laasesmed.dk: topbjælke 38px, hovednav 72px, logo 208px der hænger ud under nav-kanten. */
export async function Header() {
  const payload = await getPayloadClient()
  const [header, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'siteSettings' }),
  ])

  // Skuffen under 992px har ét flat sæt links: topbjælkens links (dropdowns foldet ud) efter de tre kategorier.
  const mobileMain = (header.navItems ?? []).map((item) => ({
    href: resolveLinkHref(item.link),
    iconSlug: linkCategorySlug(item.link) ?? undefined,
    label: item.link?.label ?? '',
  }))
  const mobileLinks = (header.utilityLinks ?? []).flatMap((item) =>
    item.children && item.children.length > 0
      ? item.children.map((child) => ({ href: resolveLinkHref(child.link), label: child.link?.label ?? '' }))
      : [{ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }],
  )
  const mobileCta = header.cta?.link?.label ? { href: resolveLinkHref(header.cta.link), label: header.cta.link.label } : undefined

  return (
    <>
      {/* Topbjælken ligger uden for den klæbende header og scroller væk, som på originalen. z-index over headeren, så dropdownen kan nå ned over den. */}
      <div className="relative z-[101] bg-ink-900 text-[#ced5e1]">
        <div className="site-container flex h-[38px] items-center justify-between text-[0.9rem] md:max-[991px]:h-11">
          <div className="flex items-center gap-8">
            {siteSettings.phone && (
              <CallLink phone={siteSettings.phone} aalborgPhone={siteSettings.departments?.[1]?.phone} />
            )}
            <span className="flex items-center gap-2 text-[#52a24d]">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#52a24d] opacity-75" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#52a24d]" />
              </span>
              Døgnvagt
            </span>
          </div>

          <nav className="hidden items-center gap-8 max-[991px]:gap-4 self-stretch font-heading leading-5 tracking-[0.25px] whitespace-nowrap md:flex">
            {(header.utilityLinks ?? []).map((item, index) =>
              item.children && item.children.length > 0 ? (
                // Hover-området fylder hele topbjælkens højde, så der ikke er et hul mellem tekst og dropdown.
                <div key={item.id ?? index} className="group relative flex h-full items-center">
                  <span className="flex cursor-default items-center gap-1">
                    {item.link?.label}
                    <ChevronDownIcon />
                  </span>
                  {/* Mål fra din-laasesmed.dk: mørk boks (samme farve som topbjælken), ikke hvid. */}
                  <div className="invisible absolute right-0 top-full z-30 flex min-w-max flex-col gap-[6px] rounded-md bg-ink-800 px-3 py-[10px] text-[#ced5e1] opacity-0 transition-[opacity,visibility] duration-200 group-hover:visible group-hover:opacity-100">
                    {item.children.map((child, childIndex) => (
                      <Link key={child.id ?? childIndex} href={resolveLinkHref(child.link)} className="whitespace-nowrap hover:text-white">
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

      {/* Hovednavigationen klæber til toppen (originalen: position sticky, top 0, z-index 100). Mega-menuen positioneres relativt til denne. */}
      <header className="sticky top-0 z-[100]">
        <div className="h-[52.2px] border-b-[0.8px] border-[#ced5e1] bg-surface-form text-text-body min-[992px]:h-[72px]">
          <div className="site-container flex h-full items-center justify-between">
            {/* Linkboksen er 28px høj; SVG'en er 55px og må gerne hænge ud under nav'en som på originalen. Under 768px er logoet 192px. */}
            <Link href={ROUTES.home()} aria-label="Forside" className="block h-7 w-[208px] self-start mt-[6.4px] text-brand-500 min-[992px]:mt-[21px] max-[767px]:w-[192px]">
              <Logo className="h-auto w-full overflow-visible" />
            </Link>

            <div className="flex items-center gap-10 self-stretch">
              <MobileMenu cta={mobileCta} links={mobileLinks} main={mobileMain} />

              <nav className="hidden items-center gap-10 self-stretch font-heading text-[0.9rem] font-medium min-[992px]:flex">
                {(header.navItems ?? []).map((item, index) => {
                  const Icon = NAV_ICON_BY_CATEGORY_SLUG[linkCategorySlug(item.link) ?? '']
                  const categoryHref = resolveLinkHref(item.link)

                  return (
                    <div key={item.id ?? index} className="group flex h-full items-center">
                      <Link href={categoryHref} className="flex items-center gap-3 py-[5px] leading-5 transition-colors duration-200 hover:text-brand-500">
                        {Icon && <Icon />}
                        {item.link?.label}
                        {item.children && item.children.length > 0 && <ChevronDownIcon />}
                      </Link>

                      {/* Mega-menu, mål og lag aflæst fra din-laasesmed.dk (1600px): mørkt bånd i fuld bredde, 5-kolonners grid, ikon = artiklens eget billede.
                          Positioneres relativt til <header> (øverste "relative"-forfader), ikke dette lille nav-punkt — ellers bliver båndet ikke fuld bredde.
                          Som originalen glider panelet ned og fader over 0,4 s. Visibility skifter først til sidst ved lukning,
                          så man kan nå at flytte musen ned i panelet. -z-10 lægger det under nav-bjælkerne, mens det glider. */}
                      {item.children && item.children.length > 0 && (
                        <div className="invisible absolute inset-x-0 top-0 -z-10 overflow-x-clip bg-[rgba(18,23,41,0.9)] py-10 font-sans opacity-0 transition-[top,opacity,visibility] duration-[400ms] group-hover:visible group-hover:top-full group-hover:opacity-100">
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
                <Link href={resolveLinkHref(header.cta.link)} className="button max-[991px]:hidden">
                  {header.cta.link.label}
                </Link>
              )}

            </div>
          </div>
        </div>
      </header>
    </>
  )
}
