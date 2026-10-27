import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RelatedBrands } from '@/components/article/RelatedBrands'
import { NAV_ICON_BY_CATEGORY_SLUG } from '@/components/layout/NavIcons'
import { RichText } from '@/components/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { firstParagraphText } from '@/lib/richtext'
import { ROUTES } from '@/lib/routes'
import { seoMetadata } from '@/lib/seo'

// Faneknapperne i introen er altid de tre hovedkategorier, også på fx "Nyheder" (hvor ingen er markeret).
const TAB_SLUGS = ['mekanisk-sikring', 'elektronisk-sikring', 'service']

async function getCategory(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return {}
  return seoMetadata({ title: category.titleTag || category.name, description: category.metaDescription })
}

/**
 * Kategorioversigt, mål aflæst fra din-laasesmed.dk/overview/* ved 1600px:
 * gråt intro-bånd (tagline, navn og faneknapper til venstre, 768px overskrift og tekst til højre),
 * 4-kolonners kortgrid der overlapper båndet med 32px, og "Alle mærker" nederst.
 */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  const payload = await getPayloadClient()
  // Originalen sorterer efter slug (fx "vaerdiskabe" før "vindueslase"), ikke efter dansk alfabet.
  const [articles, brands] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: { category: { equals: category.id }, _status: { equals: 'published' } },
      sort: 'slug',
      limit: 100,
      depth: 1,
    }),
    payload.find({
      collection: 'brands',
      where: { _status: { equals: 'published' } },
      sort: 'slug',
      limit: 100,
      depth: 1,
    }),
  ])

  return (
    <main>
      <section className="relative overflow-x-clip bg-surface-muted pt-(--fluid-section) pb-(--fluid-pad)">
        <div className="site-container relative z-10 flex flex-col gap-12 min-[992px]:flex-row min-[992px]:justify-between">
          <div className="flex shrink-0 flex-col justify-between gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-[21px] font-medium text-brand-500">Din lokale låsesmed siden 1992</p>
              <h1 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.5] font-light text-ink-900">
                {category.name}
              </h1>
            </div>

            <nav className="flex gap-2" aria-label="Kategorier">
              {TAB_SLUGS.map((tabSlug) => {
                const Icon = NAV_ICON_BY_CATEGORY_SLUG[tabSlug]
                const isCurrent = tabSlug === category.slug
                return (
                  <Link
                    key={tabSlug}
                    href={ROUTES.category(tabSlug)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-brand-500 text-[#edf0f3]'
                        : 'bg-[#ced5e1] text-text-body hover:bg-[#69748c] hover:text-background'
                    }`}
                  >
                    {Icon && <Icon className="h-auto w-[1.35rem]" />}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex w-full max-w-[768px] flex-col gap-8">
            <h2 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-h2) leading-[1.3] font-light text-ink-800">
              {category.mainHeading}
            </h2>
            {/* Sidste afsnit uden bundmargin, ellers bliver båndet 10px højere end originalen. */}
            {category.mainText && <RichText data={category.mainText} className="[&>:last-child]:mb-0" />}
          </div>
        </div>
      </section>

      {articles.docs.length > 0 && (
        <section className="relative -mt-8 pb-(--fluid-section)">
          <ul className="site-container relative z-10 grid auto-rows-fr grid-cols-1 gap-8 min-[480px]:grid-cols-2 min-[992px]:grid-cols-4">
            {articles.docs.map((article) => {
              const imageUrl = mediaUrl(article.mainImage, 'ratio32')
              const excerpt = firstParagraphText(article.mainText)
              return (
                <li key={article.id} className="group relative flex flex-col">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface-muted">
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={mediaAlt(article.mainImage)}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute inset-0 bg-surface-muted opacity-0 transition-opacity duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:opacity-20" />
                  </div>
                  <div className="mt-4 flex flex-col">
                    <h3 className="text-trim mt-5 mb-[10px] font-heading text-xl leading-[22px] text-ink-800 transition-colors duration-200 group-hover:text-brand-500">
                      {article.name}
                    </h3>
                    {excerpt && <p className="text-trim mt-4 mb-px line-clamp-2 text-sm leading-[21px]">{excerpt}</p>}
                  </div>
                  <Link href={ROUTES.article(article.slug)} className="absolute inset-0" aria-label={article.name} />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <RelatedBrands brands={brands.docs} title="Alle mærker" />
    </main>
  )
}
