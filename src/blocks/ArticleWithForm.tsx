import type { Block } from 'payload'

import { ArticleWithForm as ArticleWithFormLayout } from '@/components/ArticleWithForm'
import { RichText } from '@/components/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ArticleWithFormBlock as ArticleWithFormBlockProps } from '@/payload-types'

/**
 * Artikel med formular (Webflow: Section / Default content): billede, overskrift og tekst i 896px,
 * "Brug for hjælp?"-formularen ved siden af. Den mest brugte sektion på de faste sider.
 */
export const articleWithFormBlock: Block = {
  slug: 'articleWithForm',
  interfaceName: 'ArticleWithFormBlock',
  labels: { singular: 'Artikel med formular', plural: 'Artikel med formular' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Billede',
      admin: { description: 'Vises i 16:9 over overskriften. Kan udelades.' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Overskrift (H1)',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Tekst',
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Formular',
      admin: { description: 'Lad stå tom for at bruge standardformularen fra Site Settings (fanen Formularer).' },
    },
    {
      name: 'overlapPrevious',
      type: 'checkbox',
      label: 'Overlap det forrige bånd',
      defaultValue: false,
      admin: { description: 'Rykker sektionen 7rem op over det forrige bånd, som på Om os.' },
    },
  ],
}

export function ArticleWithForm({ content, form, heading, image, overlapPrevious }: ArticleWithFormBlockProps) {
  return (
    <ArticleWithFormLayout
      form={form}
      imageUrl={mediaUrl(image)}
      imageAlt={mediaAlt(image)}
      heading={heading}
      className={overlapPrevious ? 'relative -mt-[calc(92px+0.0458*(100vw-375px))] min-[992px]:-mt-[calc(var(--fluid-section)+27px)]' : ''}
    >
      {/* Ingen fuld bredde: som på originalen er teksten kun så bred som sit indhold, op til 896px. */}
      <RichText data={content} className="[&>:last-child]:mb-0" />
    </ArticleWithFormLayout>
  )
}
