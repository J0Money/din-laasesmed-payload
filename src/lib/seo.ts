import type { Metadata } from 'next'

/** Sitets offentlige adresse. Bruges til sitemap og delings-billeder; kan overstyres med SITE_URL. */
export const SITE_URL = (process.env.SITE_URL || 'https://din-laasesmed.dk').replace(/\/$/, '')

/** Titel, beskrivelse og delings-metadata (Open Graph og Twitter) som på originalen: samme tekst og stort delings-kort. */
export function seoMetadata({
  description,
  image,
  title,
}: {
  description?: string | null
  image?: string
  title: string
}): Metadata {
  const desc = description?.trim() || undefined
  return {
    title,
    description: desc,
    openGraph: { type: 'website', title, description: desc, images: image ? [image] : undefined },
    twitter: { card: 'summary_large_image', title, description: desc, images: image ? [image] : undefined },
  }
}
