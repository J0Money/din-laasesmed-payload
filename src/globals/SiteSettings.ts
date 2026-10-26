import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  admin: {
    group: 'Konfiguration',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Virksomhed',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'certificationLogo',
              type: 'upload',
              relationTo: 'media',
              label: 'Certificeringslogo',
              admin: { description: 'Vises i footeren, fx ISO 9001.' },
            },
            {
              name: 'companyName',
              type: 'text',
              label: 'Virksomhedsnavn',
            },
            {
              name: 'cvr',
              type: 'text',
              label: 'CVR-nummer',
            },
            {
              name: 'address',
              type: 'text',
              label: 'Adresse',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Telefon',
              admin: {
                description: 'Bruges af footer, kontaktside og schema.org-data.',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'E-mail',
            },
            {
              name: 'openingHours',
              type: 'array',
              label: 'Åbningstider',
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Dage' },
                { name: 'hours', type: 'text', required: true, label: 'Tidsrum' },
              ],
            },
          ],
        },
        {
          label: 'Afdelinger',
          fields: [
            {
              name: 'departments',
              type: 'array',
              label: 'Butikker/afdelinger',
              fields: [
                { name: 'name', type: 'text', required: true, label: 'Navn' },
                { name: 'address', type: 'text', required: true, label: 'Adresse' },
                { name: 'phone', type: 'text', required: true, label: 'Telefon' },
                { name: 'email', type: 'email', label: 'E-mail' },
              ],
            },
          ],
        },
        {
          label: 'Formularer',
          fields: [
            {
              name: 'ctaForm',
              type: 'relationship',
              relationTo: 'forms',
              label: '"Brug for hjælp?"-formular',
              admin: {
                description:
                  'Vises ved siden af artikler, mærker og i blokken "Artikel med formular", medmindre blokken vælger en anden.',
              },
            },
          ],
        },
        {
          label: 'Sociale medier',
          fields: [
            {
              name: 'facebook',
              type: 'text',
              label: 'Facebook-URL',
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'Instagram-URL',
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn-URL',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'defaultTitleTag',
              type: 'text',
              label: 'Standard title tag',
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              label: 'Standard meta description',
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Standard OG-billede',
            },
          ],
        },
      ],
    },
  ],
}
