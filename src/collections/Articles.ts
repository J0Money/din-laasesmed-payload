import type { CollectionConfig } from 'payload'

import { seoFields } from '@/fields/seo'
import { publishWhenViaMcp } from '@/lib/publishViaMcp'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'category', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [publishWhenViaMcp],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Used in the URL: /artikler/<slug>',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Category',
      admin: {
        description:
          'Leave empty for articles without a category, e.g. location pages like "Låsesmed Aalborg".',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Main image',
    },
    {
      name: 'mainHeading',
      type: 'text',
      required: true,
      label: 'Heading (H1)',
    },
    {
      name: 'mainText',
      type: 'richText',
      required: true,
      label: 'Body text',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish date',
      admin: {
        position: 'sidebar',
        description: 'Controls the order in "Læs også" (newest first).',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'brands',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
      label: 'Related brands',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'SEO',
          fields: [
            ...seoFields,
            {
              name: 'sitemapIndexing',
              type: 'checkbox',
              label: 'Show in sitemap/search engines',
              defaultValue: true,
            },
          ],
        },
      ],
    },
  ],
}
