import Link from 'next/link'

import { getCms } from '@/lib/cms'
import { ROUTES } from '@/lib/routes'

import { Logo } from './Logo'

/** Slank top til sider med ét mål (prisberegneren): kun logo og telefonnummer, ingen menu. */
export async function FocusHeader() {
  const payload = await getCms()
  const siteSettings = await payload.findGlobal({ slug: 'siteSettings' })

  return (
    <header className="relative z-[100] h-[52.2px] border-b-[0.8px] border-[#ced5e1] bg-surface-form text-text-body min-[992px]:h-[72px]">
      <div className="site-container flex h-full items-center justify-between">
        {/* Samme logo som i den almindelige header: linkboksen er 28px høj, og logoet hænger ud under bjælken. */}
        <Link href={ROUTES.home()} aria-label="Forside" className="mt-[6.4px] block h-7 w-[208px] self-start text-brand-500 max-[767px]:w-[192px] min-[992px]:mt-[21px]">
          <Logo className="h-auto w-full overflow-visible" />
        </Link>
        {siteSettings.phone && (
          <a href={`tel:${siteSettings.phone.replace(/\s/g, '')}`} className="button-outline whitespace-nowrap max-[991px]:h-9 max-[991px]:px-4">
            <span className="max-[479px]:hidden">Ring til&nbsp;</span>
            {siteSettings.phone}
          </a>
        )}
      </div>
    </header>
  )
}
