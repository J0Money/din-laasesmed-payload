import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ReadAlso } from '@/components/article/ReadAlso'
import { RelatedBrands } from '@/components/article/RelatedBrands'
import { ContactFormSidebar } from '@/components/ContactFormSidebar'
import { RichText } from '@/components/RichText'
import { mediaAlt, mediaDimensions, mediaUrl, SIZES } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'
import type { Brand, Category } from '@/payload-types'

export const revalidate = 60

async function getArticle(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0]
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 1000,
  })
  return result.docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}

  return {
    title: article.titleTag || article.mainHeading,
    description: article.metaDescription || undefined,
  }
}

/**
 * Opbygning og mål aflæst fra din-laasesmed.dk/artikler/* (1600px viewport):
 * sløret hero-bånd 396px, indhold 896px + formular 400px med 48px mellemrum.
 */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const category = typeof article.category === 'object' ? (article.category as Category) : null
  const imageUrl = mediaUrl(article.mainImage, 'hero')
  const { width, height } = mediaDimensions(article.mainImage, 'hero')

  const brands = (article.brands ?? []).filter((brand): brand is Brand => typeof brand === 'object')

  return (
    <main>
      <section className="relative bg-background py-20">
        {/* Værdier fra originalens CSS: bånd 4:1 (2:1 på mobil), billede opacity .15 + saturate(200%) blur(14px). */}
        <div aria-hidden className="absolute inset-x-0 top-0 aspect-[2/1] overflow-hidden bg-surface-muted md:aspect-[4/1]">
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover opacity-15 [filter:saturate(200%)_blur(14px)]"
            />
          )}
        </div>
  
        <div className="site-container relative z-10 lg:flex lg:items-start lg:justify-between lg:gap-12">
          <article className="min-w-0 lg:shrink-0 lg:basis-[min(896px,calc(100%-297px))]">
            {category && (
              <Link
                href={ROUTES.category(category.slug)}
                className="block text-sm leading-[21px] font-medium text-brand-500"
              >
                {category.name}
              </Link>
            )}
  
            {/* På originalen er artiklens navn en h2 før billedet, og "mainHeading" den egentlige h1 efter. */}
            <p className="text-trim mt-7 mb-[10px] font-heading text-[32px] leading-[48px] font-light text-ink-800">
              {article.name}
            </p>
  
            {imageUrl && (
              <img
                src={imageUrl}
                alt={mediaAlt(article.mainImage)}
                width={width}
                height={height}
                loading="eager"
                sizes={SIZES.hero}
                className="mt-[42px] aspect-video w-full rounded-2xl object-cover shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
              />
            )}
  
            <h1 className="text-trim mt-[52px] mb-[10px] font-heading text-[40px] leading-[52px] font-light text-ink-800">
              {article.mainHeading}
            </h1>
  
            <div className="mt-[22px] flex flex-wrap items-center gap-4">
              <Link href={ROUTES.contact()} className="button-accent">
                Kontakt os i dag
              </Link>
              <span className="text-text-body">Få et gratis servicetjek</span>
            </div>
  
            <RichText data={article.mainText} className="mt-12" />
          </article>
  
          <aside className="mt-12 lg:sticky lg:top-8 lg:mt-0 lg:max-w-[400px] lg:flex-1">
            <ContactFormSidebar />
          </aside>
        </div>
      </section>

      {category && <ReadAlso articleId={article.id} category={category} />}
      <RelatedBrands brands={brands} />
    </main>
  )
}
