import Link from 'next/link'

import { resolveLinkHref } from '@/lib/link'
import { getPayloadClient } from '@/lib/payload'

export async function Footer() {
  const payload = await getPayloadClient()
  const [footer, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'siteSettings' }),
  ])

  return (
    <footer className="mt-24 bg-ink-900 text-white">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold">{siteSettings.companyName || 'Din Låsesmed'}</p>
          {siteSettings.address && <p className="mt-2 text-sm text-white/70">{siteSettings.address}</p>}
          {siteSettings.cvr && <p className="mt-1 text-sm text-white/70">CVR {siteSettings.cvr}</p>}
        </div>

        <div className="text-sm">
          {siteSettings.phone && (
            <p>
              <a href={`tel:${siteSettings.phone.replace(/\s/g, '')}`} className="hover:text-brand-500">
                {siteSettings.phone}
              </a>
            </p>
          )}
          {siteSettings.email && (
            <p className="mt-1">
              <a href={`mailto:${siteSettings.email}`} className="hover:text-brand-500">
                {siteSettings.email}
              </a>
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {(footer.links ?? []).map((item, index) => (
            <Link key={item.id ?? index} href={resolveLinkHref(item.link)} className="hover:text-brand-500">
              {item.link?.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {siteSettings.companyName || 'Din Låsesmed'}
      </div>
    </footer>
  )
}
