import type { CollectionConfig } from 'payload'

import { seoFields } from '@/fields/seo'
import { publishWhenViaMcp } from '@/lib/publishViaMcp'

export const Brands: CollectionConfig = {
  slug: 'brands',
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
        description: 'Used in the URL: /brands/<slug>',
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
      label: 'Main image',
    },
    {
      name: 'mainAlt',
      type: 'text',
      label: 'Alt text for main image',
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
      name: 'accordion',
      type: 'array',
      label: 'Accordion sections',
      maxRows: 4,
      admin: {
        description: 'Up to 4 accordion sections at the bottom of the page (title, image, text).',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
        },
        {
          name: 'text',
          type: 'richText',
          label: 'Text',
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'SEO',
          fields: [
            ...seoFields,
          ],
        },
      ],
    },
  ],
}
