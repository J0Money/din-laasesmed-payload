import type { CollectionConfig } from 'payload'

import { allBlocks } from '@/blocks'
import { blocksAdminDescription } from '@/blocks/fields/blockAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Indhold',
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
      label: 'Titel',
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
      label: 'Overordnet side',
      admin: {
        description: 'Bruges til sidetræ. Ikke i brug endnu.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Indhold',
      blocks: allBlocks,
      admin: {
        description: blocksAdminDescription(allBlocks),
      },
    },
  ],
}
