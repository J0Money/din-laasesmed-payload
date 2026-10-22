import Link from 'next/link'

import { resolveLinkHref } from '@/lib/link'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

import { Logo } from './Logo'

export async function Header() {
  const payload = await getPayloadClient()
  const header = await payload.findGlobal({ slug: 'header' })

  return (
    <header className="border-b border-surface-muted bg-white text-ink-900">
      <div className="container flex items-center justify-between gap-6 py-4">
        <Link href={ROUTES.home()} aria-label="Forside" className="text-brand-500">
          <Logo className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {(header.navItems ?? []).map((item, index) => (
            <div key={item.id ?? index} className="group relative">
              <Link href={resolveLinkHref(item.link)} className="hover:text-brand-500">
                {item.link?.label}
              </Link>

              {item.children && item.children.length > 0 && (
                <div className="absolute left-0 top-full hidden min-w-48 flex-col gap-1 rounded-lg bg-white p-2 text-ink-900 shadow-lg group-hover:flex">
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
          ))}
        </nav>

        {header.cta?.link?.label && (
          <Link href={resolveLinkHref(header.cta.link)} className="button">
            {header.cta.link.label}
          </Link>
        )}
      </div>
    </header>
  )
}
