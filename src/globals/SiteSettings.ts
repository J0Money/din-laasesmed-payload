import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
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
              label: 'Certification logo',
              admin: { description: 'Shown in the footer, e.g. ISO 9001.' },
            },
            {
              name: 'companyName',
              type: 'text',
              label: 'Company name',
            },
            {
              name: 'cvr',
              type: 'text',
              label: 'CVR number',
            },
            {
              name: 'address',
              type: 'text',
              label: 'Address',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Phone',
              admin: {
                description: 'Used by the footer, the contact page and schema.org data.',
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
              label: 'Opening hours',
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Days' },
                { name: 'hours', type: 'text', required: true, label: 'Hours' },
              ],
            },
          ],
        },
        {
          label: 'Departments',
          fields: [
            {
              name: 'departments',
              type: 'array',
              label: 'Stores/departments',
              fields: [
                { name: 'name', type: 'text', required: true, label: 'Name' },
                { name: 'address', type: 'text', required: true, label: 'Address' },
                { name: 'phone', type: 'text', required: true, label: 'Phone' },
                { name: 'email', type: 'email', label: 'E-mail' },
              ],
            },
          ],
        },
        {
          label: 'Forms',
          fields: [
            {
              name: 'ctaForm',
              type: 'relationship',
              relationTo: 'forms',
              label: '"Brug for hjælp?" form',
              admin: {
                description:
                  'Shown next to articles and brands and in the "Article with form" block, unless the block picks another form.',
              },
            },
          ],
        },
        {
          label: 'Social media',
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
              label: 'Default title tag',
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              label: 'Default meta description',
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Default OG image',
            },
          ],
        },
      ],
    },
  ],
}
