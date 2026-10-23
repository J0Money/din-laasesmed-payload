import type { Metadata } from 'next'
import Link from 'next/link'

import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Kvalitetsmærker hos Din Låsesmed – Professionelle sikkerhedsløsninger',
  description:
    'Vi forhandler kun anerkendte mærker inden for låse og sikkerhed. Høj kvalitet, pålidelighed og dokumenteret sikkerhed.',
}

/**
 * Mærkeoversigt, mål aflæst fra din-laasesmed.dk/brands ved 1600px: samme grå intro-bånd som kategorisiderne
 * og et 4-kolonners gitter af hvide 2:1-kort med logoet (200px) i midten, der overlapper båndet med 32px.
 */
export default async function BrandsPage() {
  const payload = await getPayloadClient()
  const brands = await payload.find({
    collection: 'brands',
    where: { _status: { equals: 'published' } },
    sort: 'slug',
    limit: 100,
    depth: 1,
  })

  return (
    <main>
      <section className="relative bg-surface-muted pt-20 pb-[112px]">
        <div className="site-container relative z-10 flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex shrink-0 flex-col gap-2">
            <p className="text-sm leading-[21px] font-medium text-brand-500">Vi forhandler</p>
            <h1 className="text-trim mt-5 mb-[10px] font-heading text-[32px] leading-[48px] font-light text-ink-900">
              Se alle mærker
            </h1>
          </div>

          <div className="flex w-full max-w-[768px] flex-col gap-8">
            <h2 className="text-trim mt-5 mb-[10px] font-heading text-[40px] leading-[52px] font-light text-ink-800">
              Garanti for kvalitet og sikkerhed
            </h2>
            <div className="rich-text [&>:last-child]:mb-0">
              <p>
                Hos Din Låsesmed i Aarhus arbejder vi kun med gennemtestede og anerkendte mærker, der lever op til høje
                krav om sikkerhed, holdbarhed og funktionalitet. Uanset om det gælder mekaniske låse, elektronisk
                adgangskontrol eller dørautomatik, leverer vi løsninger fra producenter, vi har tillid til – både teknisk
                og kvalitetsmæssigt.
              </p>
              <p>
                Vi forhandler bl.a. produkter fra Ruko, iLOQ, Salto, Yale, EVVA, GEGE, Dorma og ASSA ABLOY. Når du vælger
                os som samarbejdspartner, er du sikret adgang til nogle af markedets bedste løsninger – professionelt
                rådgivet og installeret.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 pb-20">
        {/* Kolonneskift som originalen (≤479, ≤767, ≤991px). Originalens kort vokser til 357px, når logoerne er
            loadet, så gitteret løber ud over containeren; her holdes kortene inden for de 1344px. */}
        <ul className="site-container relative z-10 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[768px]:grid-cols-3 min-[992px]:grid-cols-4">
          {brands.docs.map((brand) => {
            const logoUrl = mediaUrl(brand.logo)
            return (
              <li
                key={brand.id}
                className="relative flex aspect-[2/1] min-h-0 items-center justify-center rounded-2xl border border-[#e4e8ef] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-colors duration-200 hover:border-brand-500"
              >
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={mediaAlt(brand.logo)} loading="lazy" className="h-auto w-[200px]" />
                )}
                <Link href={ROUTES.brand(brand.slug)} className="absolute inset-0" aria-label={brand.name} />
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
