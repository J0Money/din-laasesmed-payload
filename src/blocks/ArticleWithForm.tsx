import type { Block } from 'payload'

import { ArticleWithForm as ArticleWithFormLayout } from '@/components/ArticleWithForm'
import { RichText } from '@/components/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ArticleWithFormBlock as ArticleWithFormBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/**
 * Artikel med formular (Webflow: Section / Default content): billede, overskrift og tekst i 896px,
 * "Brug for hjælp?"-formularen ved siden af. Den mest brugte sektion på de faste sider.
 */
export const articleWithFormBlock: Block = {
  slug: 'articleWithForm',
  interfaceName: 'ArticleWithFormBlock',
  labels: { singular: 'Article with form', plural: 'Articles with form' },
  fields: contentWithSpacingTabs('articleWithForm', [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      admin: { description: 'Shown in 16:9 above the heading. Can be left out.' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading (H1)',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Text',
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Form',
      admin: { description: 'Leave empty to use the default form from Site Settings (Forms tab).' },
    },
    {
      name: 'overlapPrevious',
      type: 'checkbox',
      label: 'Overlap the previous band',
      defaultValue: false,
      admin: { description: 'Moves the section 7rem up over the previous band, as on Om os.' },
    },
  ]),
}

export function ArticleWithForm({ content, form, heading, image, overlapPrevious }: ArticleWithFormBlockProps) {
  return (
    <ArticleWithFormLayout
      form={form}
      imageUrl={mediaUrl(image)}
      imageAlt={mediaAlt(image)}
      heading={heading}
      overlapPrevious={Boolean(overlapPrevious)}
    >
      {/* Ingen fuld bredde: som på originalen er teksten kun så bred som sit indhold, op til 896px. */}
      <RichText data={content} className="[&>:last-child]:mb-0" />
    </ArticleWithFormLayout>
  )
}
