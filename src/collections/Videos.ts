import type { CollectionConfig } from 'payload'

/**
 * Videofiler til video-bånd. Ligger i en undermappe af medie-mappen, så de også havner på Railways volume
 * (kun /app/media er persistent).
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videoer' },
  admin: {
    group: 'System',
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
  },
  fields: [],
  upload: {
    staticDir: `${process.env.MEDIA_STATIC_DIR || 'media'}/videos`,
    mimeTypes: ['video/*'],
  },
}
