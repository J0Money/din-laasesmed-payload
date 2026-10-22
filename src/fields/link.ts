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
      label: 'Linktype',
      options: [
        { label: 'Intern side', value: 'reference' },
        { label: 'Ekstern/brugerdefineret URL', value: 'custom' },
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
      label: 'Linktekst',
    },
    {
      name: 'reference',
      type: 'relationship',
      relationTo: ['pages', 'categories', 'articles'],
      label: 'Side',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
        description: 'Linket følger dokumentets URL automatisk — ret i dokumentet, ikke her.',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
        description: 'Fx en ekstern adresse eller et tel:-link.',
      },
    },
    {
      name: 'newTab',
      type: 'checkbox',
      label: 'Åbn i nyt vindue',
      defaultValue: false,
    },
  ],
}
