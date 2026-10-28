import type { Metadata } from 'next'

import { mediaUrl } from '@/lib/media'
import { getCms } from '@/lib/cms'
import type { Media } from '@/payload-types'

/** Sitets offentlige adresse. Bruges til sitemap og delings-billeder; kan overstyres med SITE_URL. */
export const SITE_URL = (process.env.SITE_URL || 'https://din-laasesmed.dk').replace(/\/$/, '')

/** Standard delings-billede fra Konfiguration > Indstillinger > SEO. Originalen bruger det samme billede på alle sider. */
async function defaultOgImage(): Promise<string | undefined> {
  const payload = await getCms()
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })
  return mediaUrl(settings.ogImage, 'og')
}

/**
 * Titel, beskrivelse og delings-metadata (Open Graph og Twitter) som på originalen: samme tekst og stort delings-kort.
 * Uden eget billede bruges standard-billedet fra indstillingerne.
 */
export async function seoMetadata({
  description,
  image,
  title,
}: {
  description?: string | null
  image?: string
  title: string
}): Promise<Metadata> {
  const desc = description?.trim() || undefined
  const shareImage = image ?? (await defaultOgImage())
  return {
    title,
    description: desc,
    openGraph: { type: 'website', title, description: desc, images: shareImage ? [shareImage] : undefined },
    twitter: { card: 'summary_large_image', title, description: desc, images: shareImage ? [shareImage] : undefined },
  }
}

type SeoDoc = {
  meta?: { description?: string | null; image?: Media | string | null; title?: string | null } | null
}

/**
 * Metadata for en side, artikel, kategori eller et mærke ud fra SEO-fanen (SEO-pluginets meta.*).
 * Billede: SEO-fanens delingsbillede, ellers fallbackImage (fx hovedbilledet), ellers standardbilledet fra indstillingerne.
 */
export function docSeoMetadata(doc: SeoDoc, { fallbackImage, fallbackTitle }: { fallbackImage?: string; fallbackTitle: string }) {
  return seoMetadata({
    title: doc.meta?.title || fallbackTitle,
    description: doc.meta?.description,
    image: mediaUrl(doc.meta?.image, 'og') ?? fallbackImage,
  })
}
