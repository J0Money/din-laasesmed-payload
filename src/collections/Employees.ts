import type { CollectionConfig } from 'payload'

export const Employees: CollectionConfig = {
  slug: 'employees',
  admin: {
    useAsTitle: 'name',
    group: 'Indhold',
    defaultColumns: ['name', 'title', 'type', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Navn',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: "Bruges i URL'en: /employees/<slug>",
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      admin: {
        description: 'F.eks.: Montør',
      },
    },
    {
      name: 'mail',
      type: 'email',
      label: 'E-mail',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'Administration', value: 'administration' },
        { label: 'Montører', value: 'montoerer' },
        { label: 'Aalborg', value: 'aalborg' },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
      admin: {
        description: 'Billedforhold 3:2.',
      },
    },
    {
      name: 'showImage',
      type: 'checkbox',
      label: 'Vis billede',
      defaultValue: true,
    },
  ],
}
