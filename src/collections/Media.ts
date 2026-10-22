import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
  },
  folders: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt-tekst',
      required: true,
      admin: {
        description: 'Beskrivelse af billedet, bruges af skærmlæsere og SEO. Må aldrig stå tom.',
      },
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_STATIC_DIR || 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'ratio32',
        width: 1200,
        height: 800,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
  },
}
