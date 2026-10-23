import { mediaAlt, mediaUrl } from '@/lib/media'
import { ROUTES } from '@/lib/routes'
import type { Brand } from '@/payload-types'

import { BrandSlider } from './BrandSlider'

/**
 * Mærke-slider som på originalen ("Relaterede mærker" på artikler, "Alle mærker" på kategorisider):
 * 312×208px kort med logo og pile øverst til højre.
 */
export function RelatedBrands({ brands, title = 'Relaterede mærker' }: { brands: Brand[]; title?: string }) {
  if (!brands.length) return null

  const slides = brands.map((brand) => ({
    id: brand.id,
    href: ROUTES.brand(brand.slug),
    name: brand.name,
    logoUrl: mediaUrl(brand.logo),
    logoAlt: mediaAlt(brand.logo),
  }))

  return (
    <section className="overflow-hidden bg-surface-muted py-20">
      <div className="site-container">
        <BrandSlider title={title} slides={slides} />
      </div>
    </section>
  )
}
