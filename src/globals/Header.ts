import type { GlobalConfig } from 'payload'

import { linkField } from '../fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    group: 'Konfiguration',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation',
      fields: [
        linkField,
        {
          name: 'children',
          type: 'array',
          label: 'Undermenupunkter',
          admin: {
            description: 'Bruges til dropdown-menuer, fx under Mekanisk sikring.',
          },
          fields: [linkField],
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Kontakt-knap',
      fields: [linkField],
    },
  ],
}
