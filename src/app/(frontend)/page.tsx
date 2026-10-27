import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { getPayloadClient } from '@/lib/payload'
import { HOME_PAGE_SLUG } from '@/lib/routes'
import { seoMetadata } from '@/lib/seo'

async function getHomePage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: HOME_PAGE_SLUG }, _status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage()
  if (!page) return {}
  return seoMetadata({ title: page.titleTag || page.title, description: page.metaDescription })
}

/** Forsiden er den udgivne Payload-side med slug "forside", bygget af blokke. */
export default async function HomePage() {
  const page = await getHomePage()
  if (!page) notFound()

  return (
    <main>
      <BlockRenderer blocks={page.layout} />
    </main>
  )
}
