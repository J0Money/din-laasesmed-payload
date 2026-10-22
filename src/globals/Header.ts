import type { GlobalConfig } from 'payload'

import { linkField } from '../fields/link'
import { navItemFields } from '../fields/navItem'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    group: 'Konfiguration',
  },
  fields: [
    {
      name: 'utilityLinks',
      type: 'array',
      label: 'Øverste bjælke (links)',
      admin: {
        description: 'Den smalle, mørke linje øverst — fx Afdelinger, Om os, Mærker, Job.',
      },
      fields: navItemFields,
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Hovednavigation',
      admin: {
        description: 'Bruges til dropdown-menuer, fx under Mekanisk sikring.',
      },
      fields: navItemFields,
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Kontakt-knap',
      fields: [linkField],
    },
  ],
}
