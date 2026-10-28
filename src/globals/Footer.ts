import type { GlobalConfig } from 'payload'

import { linkField } from '../fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Link list',
      fields: [linkField],
    },
  ],
}
