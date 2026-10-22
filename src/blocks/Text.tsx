import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Block } from 'payload'

import { BlockWrapper } from '@/components/blocks/BlockWrapper'
import type { TextBlock as TextBlockProps } from '@/payload-types'

import { layoutTab } from './fields/layout'

/** Ren brødtekst i læsebredde. */
export const textBlock: Block = {
  slug: 'text',
  interfaceName: 'TextBlock',
  labels: { singular: 'Tekst', plural: 'Tekst' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Indhold',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: 'Tekst',
            },
          ],
        },
        layoutTab(),
      ],
    },
  ],
}

export function Text({
  content,
  spacingAfter,
  spacingBefore,
  mutedBackground,
  blockClass,
}: TextBlockProps) {
  return (
    <BlockWrapper
      spacingBefore={spacingBefore}
      spacingAfter={spacingAfter}
      mutedBackground={mutedBackground}
      blockClass={blockClass}
    >
      <div className="container max-w-3xl">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <RichText data={content as any} />
      </div>
    </BlockWrapper>
  )
}
