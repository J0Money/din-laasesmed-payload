import { RichText } from '@/components/RichText'
import type { Block } from 'payload'

import { BlockWrapper } from '@/components/blocks/BlockWrapper'
import { mediaAlt, mediaDimensions, mediaUrl, SIZES } from '@/lib/media'
import type { TextWithImageBlock as TextWithImageBlockProps } from '@/payload-types'

import { layoutTab } from './fields/layout'

/** Tekst og billede side om side. */
export const textWithImageBlock: Block = {
  slug: 'textWithImage',
  interfaceName: 'TextWithImageBlock',
  labels: { singular: 'Tekst med billede', plural: 'Tekst med billede' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Indhold',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Billede',
            },
            {
              name: 'imagePosition',
              type: 'radio',
              label: 'Billedets placering',
              defaultValue: 'right',
              options: [
                { label: 'Venstre', value: 'left' },
                { label: 'Højre', value: 'right' },
              ],
              admin: { layout: 'horizontal' },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: 'Tekst',
            },
          ],
        },
        layoutTab('textWithImage'),
      ],
    },
  ],
}

export function TextWithImage({
  content,
  image,
  imagePosition,
  mutedBackground,
  blockClass,
}: TextWithImageBlockProps) {
  const { width, height } = mediaDimensions(image, 'ratio32')

  return (
    <BlockWrapper
      mutedBackground={mutedBackground}
      blockClass={blockClass}
    >
      <div
        className={`site-container grid items-center gap-8 md:grid-cols-2 ${
          imagePosition === 'left' ? 'md:[&>*:first-child]:order-2' : ''
        }`}
      >
        <RichText data={content} />
        <img
          src={mediaUrl(image, 'ratio32')}
          alt={mediaAlt(image)}
          width={width}
          height={height}
          loading="lazy"
          sizes={SIZES.inline}
          className="h-auto w-full rounded-xl object-cover"
        />
      </div>
    </BlockWrapper>
  )
}
