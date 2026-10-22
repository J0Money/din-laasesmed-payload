import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const category = typeof article.category === 'object' ? (article.category as Category) : null
  const brands = (article.brands ?? []).filter(
    (brand): brand is Brand => typeof brand === 'object',
  )
  const { width, height } = mediaDimensions(article.mainImage, 'hero')

  return (
    <main>
      <article className="container max-w-3xl py-16">
        {category && (
          <Link href={ROUTES.category(category.slug)} className="text-sm text-brand-500 hover:underline">
            {category.name}
          </Link>
        )}

        <h1 className="mt-2 text-4xl font-semibold text-ink-900">{article.mainHeading}</h1>

        {article.mainImage && (
          <img
            src={mediaUrl(article.mainImage, 'hero')}
            alt={mediaAlt(article.mainImage)}
            width={width}
            height={height}
            loading="eager"
            sizes={SIZES.hero}
            className="mt-8 h-auto w-full rounded-xl object-cover"
          />
        )}

        <div className="rich-text mt-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RichText data={article.mainText as any} />
        </div>

        {brands.length > 0 && (
          <div className="mt-12 border-t border-surface-muted pt-8">
            <h2 className="text-sm font-semibold text-ink-900">Relevante mærker</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={ROUTES.brand(brand.slug)}
                    className="rounded-full bg-surface-muted px-4 py-2 text-sm hover:bg-brand-500 hover:text-white"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </main>
  )
}
