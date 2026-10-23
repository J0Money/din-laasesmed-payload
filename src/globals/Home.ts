import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  admin: {
    group: 'Sider',
  },
  fields: [
    {
      name: 'visual',
      type: 'group',
      label: '"Den rette løsning" — billede',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Billede' },
        { name: 'ctaLabel', type: 'text', label: 'Knaptekst', defaultValue: 'Besøg os i Aarhus' },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Kundeudtalelser',
      admin: { description: 'Skifter automatisk hvert 5. sekund.' },
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: 'Citat' },
        { name: 'author', type: 'text', required: true, label: 'Kunde' },
      ],
    },
    {
      name: 'statsImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Statistik-bånd — baggrundsbillede',
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistik-tal',
      maxRows: 4,
      fields: [
        { name: 'value', type: 'number', required: true, label: 'Tal' },
        { name: 'label', type: 'text', required: true, label: 'Label' },
      ],
    },
    {
      name: 'focusCards',
      type: 'group',
      label: 'Fokus-kort (Mekanisk/Elektronisk sikring + servicetjek)',
      fields: [
        { name: 'mekaniskImage', type: 'upload', relationTo: 'media', label: 'Mekanisk sikring — billede' },
        { name: 'elektroniskImage', type: 'upload', relationTo: 'media', label: 'Elektronisk sikring — billede' },
        { name: 'serviceImage', type: 'upload', relationTo: 'media', label: 'Servicetjek — baggrundsbillede' },
      ],
    },
    {
      name: 'businessCustomers',
      type: 'array',
      label: 'Erhvervskunder',
      labels: { singular: 'Erhvervskunde', plural: 'Erhvervskunder' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Billede/logo' },
        { name: 'label', type: 'text', label: 'Stedsnavn (valgfrit, vises som badge over fotos)' },
        { name: 'type', type: 'radio', label: 'Type', options: [{ label: 'Logo', value: 'logo' }, { label: 'Foto', value: 'photo' }], defaultValue: 'logo' },
        {
          name: 'bgColor',
          type: 'text',
          label: 'Baggrundsfarve (kun logo-type, hex)',
          defaultValue: '#ffffff',
          admin: { condition: (_, siblingData) => siblingData?.type === 'logo' },
        },
        {
          name: 'logoHeight',
          type: 'number',
          label: 'Logohøjde i px (kun logo-type)',
          defaultValue: 96,
          admin: { condition: (_, siblingData) => siblingData?.type === 'logo' },
        },
      ],
    },
  ],
}
