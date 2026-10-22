import Link from 'next/link'

import { mediaAlt, mediaUrl } from '@/lib/media'
import { ROUTES } from '@/lib/routes'
import type { Brand } from '@/payload-types'

/**
 * "Relaterede mærker" som på originalen: 312×208px kort med logo, vandret rækkefølge.
 * Originalens slider-pile vises kun, når kortene ikke kan være der; her scrolles der i stedet.
 */
export function RelatedBrands({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null

  return (
    <section className="bg-surface-muted py-20">
      <div className="site-container">
        <h2 className="text-trim mt-5 mb-[42px] font-heading text-[32px] leading-[48px] font-light text-ink-800">
          Relaterede mærker
        </h2>
        <ul className="flex gap-8 overflow-x-auto pb-2">
          {brands.map((brand) => {
            const logo = mediaUrl(brand.logo)
            return (
              <li
                key={brand.id}
                className="relative flex h-[208px] w-[312px] shrink-0 items-center justify-center rounded-2xl border-[0.8px] border-[#ced5e1] bg-surface-form px-12 py-8 transition hover:border-brand-500 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
              >
                {logo ? (
                  <img src={logo} alt={mediaAlt(brand.logo) || brand.name} className="h-[100px] w-[200px] object-contain" />
                ) : (
                  <span className="font-heading text-xl text-ink-800">{brand.name}</span>
                )}
                <Link href={ROUTES.brand(brand.slug)} className="absolute inset-0" aria-label={brand.name} />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
