import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { getCms } from '@/lib/cms'
import { HOME_PAGE_SLUG } from '@/lib/routes'
import { docSeoMetadata } from '@/lib/seo'

async function getPage(slug: string) {
  const payload = await getCms()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return docSeoMetadata(page, { fallbackTitle: page.title })
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Forsiden vises på "/", ikke på sin egen adresse.
  if (slug === HOME_PAGE_SLUG) redirect('/')
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <main>
      <BlockRenderer blocks={page.layout} />
    </main>
  )
}
