import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Field } from 'payload'

/**
 * SEO-felterne fra Payloads SEO-plugin (meta.title, meta.description, meta.image) med længdetjek og Google-forhåndsvisning.
 * Lægges i hver indholdstypes SEO-fane. "Generate" foreslår kun en titel (se lib/seoPlugin.ts); beskrivelser skrives i hånden.
 */
export const seoFields: Field[] = [
  {
    name: 'meta',
    type: 'group',
    label: false,
    fields: [
      OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
      MetaTitleField({ hasGenerateFn: true, overrides: { label: 'Meta title' } }),
      MetaDescriptionField({ hasGenerateFn: false, overrides: { label: 'Meta description' } }),
      MetaImageField({
        relationTo: 'media',
        hasGenerateFn: false,
        overrides: {
          label: 'Share image',
          admin: { description: 'Shown when the page is shared (Facebook, LinkedIn etc.). Leave empty to use the main image or the default image from Site Settings.' },
        },
      }),
      PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
    ],
  },
]
