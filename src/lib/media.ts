import type { Media } from '@/payload-types'

type MediaSize = keyof NonNullable<Media['sizes']>

/** Henter altid et brugbart forhold mellem brug og bredde, så ingen skal skrive `sizes` i hånden. */
export const SIZES = {
  card: '(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw',
  hero: '100vw',
  inline: '(max-width: 767px) 100vw, 50vw',
} as const

export function mediaUrl(media: Media | number | null | string | undefined, size?: MediaSize): string | undefined {
  if (!media || typeof media !== 'object') return undefined
  if (size) {
    const sized = media.sizes?.[size]
    if (sized?.url) return sized.url
  }
  return media.url ?? undefined
}

export function mediaAlt(media: Media | number | null | string | undefined): string {
  if (!media || typeof media !== 'object') return ''
  return media.alt || ''
}

export function mediaDimensions(
  media: Media | number | null | string | undefined,
  size?: MediaSize,
): { height?: number; width?: number } {
  if (!media || typeof media !== 'object') return {}
  if (size) {
    const sized = media.sizes?.[size]
    if (sized?.width && sized?.height) return { width: sized.width, height: sized.height }
  }
  return { width: media.width ?? undefined, height: media.height ?? undefined }
}
