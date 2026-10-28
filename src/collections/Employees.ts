import type { CollectionConfig } from 'payload'

export const Employees: CollectionConfig = {
  slug: 'employees',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'title', 'type', 'sortOrder', 'showOnAbout'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Used in the URL: /employees/<slug>',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: {
        description: 'E.g.: Montør (technician)',
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
      label: 'Phone',
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'Administration', value: 'administration' },
        { label: 'Technicians', value: 'montoerer' },
        { label: 'Aalborg', value: 'aalborg' },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
      admin: {
        description: 'Aspect ratio 3:2.',
      },
    },
    {
      name: 'showImage',
      type: 'checkbox',
      label: 'Show image',
      defaultValue: true,
    },
    {
      name: 'showOnAbout',
      type: 'checkbox',
      label: 'Show on About us',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort order',
      admin: {
        description: 'Lowest first within the group on About us.',
      },
    },
  ],
}
