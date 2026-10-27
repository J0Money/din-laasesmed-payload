import Link from 'next/link'
import type { Block } from 'payload'

import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

import { contentWithSpacingTabs } from './fields/layout'

/** Mærkeoversigt (Webflow: Section / Overview): alle udgivne mærker som logokort. Kræver ingen indstillinger. */
export const brandGridBlock: Block = {
  slug: 'brandGrid',
  interfaceName: 'BrandGridBlock',
  labels: { singular: 'Mærkeoversigt', plural: 'Mærkeoversigt' },
  fields: contentWithSpacingTabs('brandGrid', [
    {
      name: 'note',
      type: 'ui',
      admin: {
        components: {
          Field: '@/blocks/fields/BrandGridNote.client#BrandGridNote',
        },
      },
    },
  ]),
}

/**
 * 4-kolonners gitter af hvide 2:1-kort med logoet (200px) i midten, der overlapper båndet over med 32px.
 * Kolonneskift som originalen (≤479, ≤767, ≤991px). Originalens kort vokser til 357px, når logoerne er loadet,
 * så gitteret løber ud over containeren; her holdes kortene inden for de 1344px.
 */
export async function BrandGrid() {
  const payload = await getPayloadClient()
  const brands = await payload.find({
    collection: 'brands',
    where: { _status: { equals: 'published' } },
    sort: 'slug',
    limit: 100,
    depth: 1,
  })

  return (
    // Originalen har 80px under mærkerne ved alle bredder (ikke den flydende skala).
    <section className="relative -mt-8 pb-20">
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
  )
}
