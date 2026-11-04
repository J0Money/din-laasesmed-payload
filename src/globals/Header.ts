import type { GlobalConfig, GroupField } from 'payload'

import { linkField } from '../fields/link'
import { navItemFields } from '../fields/navItem'

// Samme link-felt, men uden krav om linktekst, så knappen kan være tom (skjult).
const optionalLink: GroupField = {
  ...(linkField as GroupField),
  fields: (linkField as GroupField).fields.map((field) =>
    'name' in field && field.name === 'label' ? { ...field, required: false } : field,
  ) as GroupField['fields'],
}

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
      name: 'secondaryCta',
      type: 'group',
      label: 'Second button',
      admin: {
        description: 'Optional white button before the contact button. Leave the link text empty to hide it.',
      },
      fields: [optionalLink],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Contact button',
      fields: [linkField],
    },
  ],
}
