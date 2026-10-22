import type { Block } from 'payload'

/** YouTube-video der kan indsættes i rich text (fx brødteksten på en artikel). */
export const videoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: { singular: 'Video', plural: 'Videoer' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube-link',
      admin: { description: 'Fx https://www.youtube.com/watch?v=... eller et embed-link.' },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      admin: { description: 'Læses op af skærmlæsere.' },
    },
  ],
}

/** Trækker video-id ud af de gængse YouTube-URL-formater. */
export function youtubeId(url: string): string | undefined {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return match?.[1]
}
