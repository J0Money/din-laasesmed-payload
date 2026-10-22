import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
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
        description: "Bruges i URL'en: /brands/<slug>",
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hovedbillede',
    },
    {
      name: 'mainAlt',
      type: 'text',
      label: 'Alt-tekst til hovedbillede',
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
      name: 'accordion',
      type: 'array',
      label: 'Foldbare sektioner',
      maxRows: 4,
      admin: {
        description: 'Op til 4 foldbare sektioner nederst på siden (titel, billede, tekst).',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Titel',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Billede',
        },
        {
          name: 'text',
          type: 'richText',
          label: 'Tekst',
        },
      ],
    },
  ],
}
