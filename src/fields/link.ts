import type { Field } from 'payload'

/**
 * Delt link-felt: peger på et dokument (Payloads anbefalede mønster) eller,
 * som fallback, en brugerdefineret URL (fx tel:-links eller eksterne sider).
 */
export const linkField: Field = {
  name: 'link',
  type: 'group',
  label: 'Link',
  fields: [
    {
      name: 'type',
      type: 'radio',
      label: 'Link type',
      options: [
        { label: 'Internal page', value: 'reference' },
        { label: 'External/custom URL', value: 'custom' },
      ],
      defaultValue: 'reference',
      admin: {
        layout: 'horizontal',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Link text',
    },
    {
      name: 'reference',
      type: 'relationship',
      relationTo: ['pages', 'categories', 'articles'],
      label: 'Page',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
        description: 'The link follows the document URL automatically. Edit it in the document, not here.',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
        description: 'E.g. an external address or a tel: link.',
      },
    },
    {
      name: 'newTab',
      type: 'checkbox',
      label: 'Open in new window',
      defaultValue: false,
    },
  ],
}
