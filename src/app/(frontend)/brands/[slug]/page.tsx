import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleWithForm } from '@/components/ArticleWithForm'
import { ArticlePreviewGrid } from '@/components/article/ReadAlso'
import { RelatedBrands } from '@/components/article/RelatedBrands'
import { RichText } from '@/components/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { seoMetadata } from '@/lib/seo'

async function getBrand(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) return {}
  return seoMetadata({
    // Originalens Scantron-side har tom titel; her falder vi tilbage på navnet.
    title: brand.titleTag || brand.name,
    description: brand.metaDescription,
    image: mediaUrl(brand.mainImage, 'og'),
  })
}

/**
 * Mærkeside, mål aflæst fra din-laasesmed.dk/brands/* ved 1600px: mørkt bånd med "Mærke" og navnet,
 * logo + artikler der nævner mærket (mellem to streger), artikel med formular og "Alle mærker" uden det aktuelle.
 * Mærkets foldbare sektioner (accordion) vises ikke på originalen, så heller ikke her.
 */
export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()

  const payload = await getPayloadClient()
  const [articles, brands] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: { brands: { contains: brand.id }, _status: { equals: 'published' } },
      // Samme rækkefølge som originalen (nyeste publicering først).
      sort: ['-publishedAt', '-createdAt'],
      limit: 100,
      depth: 1,
    }),
    payload.find({
      collection: 'brands',
      where: { _status: { equals: 'published' }, id: { not_equals: brand.id } },
      sort: 'slug',
      limit: 100,
      depth: 1,
    }),
  ])

  const logoUrl = mediaUrl(brand.logo)

  return (
    <main>
      <section className="bg-ink-800 py-(--fluid-section)">
        <div className="site-container">
          <p className="text-sm leading-[21px] font-medium text-[#ced5e1]">Mærke</p>
          <h2 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.5] font-light text-[#edf0f3]">
            {brand.name}
          </h2>
        </div>
      </section>

      <section className="overflow-x-clip bg-background">
        <div className="site-container">
          <div className="flex flex-col gap-12 border-y border-[#ced5e1] py-(--fluid-section) max-[991px]:pb-[calc(var(--fluid-section)+45px)] max-[767px]:gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div data-animate="fade-up" className="w-48 shrink-0">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={mediaAlt(brand.logo)} className="h-auto w-full" />
              )}
            </div>
            {articles.docs.length > 0 && <ArticlePreviewGrid articles={articles.docs} />}
          </div>
        </div>
      </section>

      <ArticleWithForm
        imageUrl={mediaUrl(brand.mainImage, 'hero')}
        imageAlt={brand.mainAlt || mediaAlt(brand.mainImage)}
        heading={brand.mainHeading}
        formFirst
      >
        {brand.mainText && <RichText data={brand.mainText} className="w-full [&>:last-child]:mb-0" />}
      </ArticleWithForm>

      <RelatedBrands brands={brands.docs} title="Alle mærker" />
    </main>
  )
}
