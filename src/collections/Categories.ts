import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Indhold',
    defaultColumns: ['name', 'slug', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Navn',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: "Bruges i URL'en: /overview/<slug>",
      },
    },
    {
      name: 'mainHeading',
      type: 'text',
      required: true,
      label: 'Overskrift (H1)',
    },
    {
      name: 'mainText',
      type: 'richText',
      label: 'Brødtekst',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'SEO',
          fields: [
            {
              name: 'titleTag',
              type: 'text',
              label: 'Title tag',
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Meta description',
            },
            {
              name: 'sitemapIndexing',
              type: 'checkbox',
              label: 'Vis i sitemap/søgemaskiner',
              defaultValue: true,
            },
          ],
        },
      ],
    },
  ],
}
