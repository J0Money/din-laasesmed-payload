import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'name',
    group: 'Indhold',
    defaultColumns: ['name', 'category', '_status', 'updatedAt'],
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
        description: "Bruges i URL'en: /artikler/<slug>",
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Kategori',
      admin: {
        description:
          'Lad stå tom for artikler uden kategori, fx lokationssider som "Låsesmed Aalborg".',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hovedbillede',
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
      required: true,
      label: 'Brødtekst',
    },
    {
      name: 'brands',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
      label: 'Relevante mærker',
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
