import type { GlobalConfig } from 'payload'

import { linkField } from '../fields/link'
import { navItemFields } from '../fields/navItem'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'utilityLinks',
      type: 'array',
      label: 'Top bar (links)',
      admin: {
        description: 'The narrow, dark line at the top, e.g. Afdelinger, Om os, Mærker, Job.',
      },
      fields: navItemFields,
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Main navigation',
      admin: {
        description: 'Used for dropdown menus, e.g. under Mekanisk sikring.',
      },
      fields: navItemFields,
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Contact button',
      fields: [linkField],
    },
  ],
}
