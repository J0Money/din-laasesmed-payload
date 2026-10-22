import type { GlobalConfig } from 'payload'

import { linkField } from '../fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Konfiguration',
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Linkliste',
      fields: [linkField],
    },
  ],
}
