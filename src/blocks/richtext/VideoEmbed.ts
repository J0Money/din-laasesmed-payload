import type { Block } from 'payload'

/** YouTube-video der kan indsættes i rich text (fx brødteksten på en artikel). */
export const videoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube link',
      admin: { description: 'E.g. https://www.youtube.com/watch?v=... or an embed link.' },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: { description: 'Read aloud by screen readers.' },
    },
  ],
}

/** Trækker video-id ud af de gængse YouTube-URL-formater. */
export function youtubeId(url: string): string | undefined {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return match?.[1]
}
