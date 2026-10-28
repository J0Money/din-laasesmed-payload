import type { CollectionConfig } from 'payload'

import { seoFields } from '@/fields/seo'
import { publishWhenViaMcp } from '@/lib/publishViaMcp'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'slug', '_status', 'updatedAt'],
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
        description: 'Used in the URL: /overview/<slug>',
      },
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
      label: 'Body text',
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
