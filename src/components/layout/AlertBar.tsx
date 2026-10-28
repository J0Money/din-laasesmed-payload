import Link from 'next/link'

import { resolveLinkHref } from '@/lib/link'
import { getPayloadClient } from '@/lib/payload'

/** Bjælken øverst, styres i admin under Konfiguration > Besked i toppen. Vises kun, når den er slået til og har en tekst. */
export async function AlertBar() {
  const payload = await getPayloadClient()
  const alert = await payload.findGlobal({ slug: 'alert' })

  if (!alert.enabled || !alert.message?.trim()) return null

  const link = alert.hasLink && alert.link?.label ? alert.link : undefined

  return (
    <div role="status" className="bg-brand-500 text-white">
      <div className="site-container flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center font-heading text-sm leading-5">
        <span>{alert.message}</span>
        {link && (
          <Link
            href={resolveLinkHref(link)}
            target={link.newTab ? '_blank' : undefined}
            rel={link.newTab ? 'noopener noreferrer' : undefined}
            className="font-medium underline underline-offset-2 transition-opacity duration-200 hover:opacity-80"
          >
            {link.label}
          </Link>
        )}
      </div>
    </div>
  )
}
