import Link from 'next/link'

import { getCms } from '@/lib/cms'
import { ROUTES } from '@/lib/routes'

import { CallLink } from './CallLink'
import { Logo } from './Logo'

/** Slank top til sider med ét mål (prisberegneren): kun logo og telefonnummer, ingen menu. */
export async function FocusHeader() {
  const payload = await getCms()
  const siteSettings = await payload.findGlobal({ slug: 'siteSettings' })

  return (
    <header className="border-b-[0.8px] border-[#ced5e1] bg-surface-form text-text-body">
      <div className="site-container flex items-center justify-between py-3">
        <Link href={ROUTES.home()} aria-label="Forside" className="block w-[192px] text-brand-500 min-[768px]:w-[208px]">
          <Logo className="h-auto w-full" />
        </Link>
        {siteSettings.phone && (
          <span className="font-heading text-[0.9rem] font-medium">
            <CallLink phone={siteSettings.phone} />
          </span>
        )}
      </div>
    </header>
  )
}
