import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60

async function getPage(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0]
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    limit: 1000,
  })
  return result.docs.map((doc) => ({ slug: doc.slug }))
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <main>
      <BlockRenderer blocks={page.layout} />
    </main>
  )
}
