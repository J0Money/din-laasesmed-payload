import Link from 'next/link'

import { linkCategorySlug, resolveLinkHref } from '@/lib/link'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

import { Logo } from './Logo'
import { NAV_ICON_BY_CATEGORY_SLUG } from './NavIcons'

export async function Header() {
  const payload = await getPayloadClient()
  const [header, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'siteSettings' }),
  ])

  return (
    <header>
      {/* Øverste bjælke */}
      <div className="bg-ink-900 text-[#ced5e1]">
        <div className="container flex items-center justify-between gap-6 py-2 text-sm">
          <div className="flex items-center gap-4">
            {siteSettings.phone && (
              <a href={`tel:${siteSettings.phone.replace(/\s/g, '')}`} className="hover:text-white">
                Ring til {siteSettings.phone}
              </a>
            )}
            <span className="flex items-center gap-1.5 text-[#52a24d]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#52a24d]" />
              Døgnvagt
            </span>
          </div>

          <nav className="hidden items-center gap-4 md:flex">
            {(header.utilityLinks ?? []).map((item, index) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id ?? index} className="group relative">
                  <span className="cursor-default hover:text-white">{item.link?.label}</span>
                  <div className="absolute right-0 top-full z-10 hidden min-w-40 flex-col gap-1 rounded-lg bg-white p-2 text-ink-900 shadow-lg group-hover:flex">
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={child.id ?? childIndex}
                        href={resolveLinkHref(child.link)}
                        className="rounded-md px-3 py-2 text-sm hover:bg-surface-muted"
                      >
                        {child.link?.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.id ?? index} href={resolveLinkHref(item.link)} className="hover:text-white">
                  {item.link?.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Hovednavigation */}
      <div className="border-b border-surface-muted bg-white text-text-body">
        <div className="container flex items-center justify-between gap-6 py-4">
          <Link href={ROUTES.home()} aria-label="Forside" className="text-brand-500">
            <Logo className="h-8 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {(header.navItems ?? []).map((item, index) => {
              const Icon = NAV_ICON_BY_CATEGORY_SLUG[linkCategorySlug(item.link) ?? '']

              return (
                <div key={item.id ?? index} className="group relative">
                  <Link
                    href={resolveLinkHref(item.link)}
                    className="flex items-center gap-1.5 hover:text-brand-500"
                  >
                    {Icon && <Icon />}
                    {item.link?.label}
                  </Link>

                  {item.children && item.children.length > 0 && (
                    <div className="absolute left-0 top-full z-10 hidden min-w-48 flex-col gap-1 rounded-lg bg-white p-2 text-ink-900 shadow-lg group-hover:flex">
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
    </header>
  )
}
