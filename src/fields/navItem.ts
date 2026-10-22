import type { Field } from 'payload'

import { linkField } from './link'

/** Delt felt-struktur for et navigationspunkt med valgfri undermenu, bruges af både top- og hovednavigation. */
export const navItemFields: Field[] = [
  linkField,
  {
    name: 'children',
    type: 'array',
    label: 'Undermenupunkter',
    fields: [linkField],
  },
]
