import type { CollectionConfig } from 'payload'

import { allBlocks } from '@/blocks'
import { blocksAdminDescription } from '@/blocks/fields/blockAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Parent page',
      admin: {
        description: 'Used for the page tree. Not in use yet.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Content',
      blocks: allBlocks,
      admin: {
        description: blocksAdminDescription(allBlocks),
      },
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
          ],
        },
      ],
    },
  ],
}
