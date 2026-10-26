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
      name: 'overlapPrevious',
      type: 'checkbox',
      label: 'Overlap det forrige bånd',
      defaultValue: false,
      admin: { description: 'Rykker sektionen 7rem op over det forrige bånd, som på Om os.' },
    },
  ],
}

export function ArticleWithForm({ content, heading, image, overlapPrevious }: ArticleWithFormBlockProps) {
  return (
    <ArticleWithFormLayout
      imageUrl={mediaUrl(image)}
      imageAlt={mediaAlt(image)}
      heading={heading}
      className={overlapPrevious ? 'relative -mt-28' : ''}
    >
      {/* Ingen fuld bredde: som på originalen er teksten kun så bred som sit indhold, op til 896px. */}
      <RichText data={content} className="[&>:last-child]:mb-0" />
    </ArticleWithFormLayout>
  )
}
