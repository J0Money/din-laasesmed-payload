import type { Block } from 'payload'

/**
 * Hvilket felt på hver block-type der skal vises som rækkelabel i admin,
 * så en side med mange blocks er til at læse i listen frem for "Untitled".
 * Udfyldes efterhånden som nye blocks bygges.
 */
export const BLOCK_ROW_LABELS: Record<string, string> = {}

/**
 * Sætter RowLabel-komponenten og miniaturen i blokvælgeren på alle blocks på én gang,
 * så det ikke skal gentages i hver enkelt block-fil. Miniaturerne er SVG'er i public/block-thumbs,
 * ét pr. slug (fx text.svg).
 */
export function prepareBlocks(blocks: Block[]): Block[] {
  return blocks.map((block) => {
    const label = typeof block.labels?.singular === 'string' ? block.labels.singular : block.slug
    const withThumb: Block = {
      ...block,
      imageURL: block.imageURL ?? `/block-thumbs/${block.slug}.svg`,
      imageAltText: block.imageAltText ?? label,
    }
    if (!BLOCK_ROW_LABELS[block.slug]) return withThumb

    return {
      ...withThumb,
      admin: {
        ...block.admin,
        components: {
          ...block.admin?.components,
          RowLabel: '@/blocks/fields/BlockRowLabel.client#BlockRowLabel',
        },
      },
    }
  })
}
