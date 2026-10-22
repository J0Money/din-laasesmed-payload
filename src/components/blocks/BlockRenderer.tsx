import { Text } from '@/blocks/Text'
import { TextWithImage } from '@/blocks/TextWithImage'
import type { Page } from '@/payload-types'

type LayoutBlocks = NonNullable<Page['layout']>
type LayoutBlock = LayoutBlocks[number]

export function BlockRenderer({ blocks }: { blocks: LayoutBlocks | null | undefined }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block: LayoutBlock) => {
        switch (block.blockType) {
          case 'text':
            return <Text key={block.id} {...block} />
          case 'textWithImage':
            return <TextWithImage key={block.id} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
