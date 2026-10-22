import type { Block } from 'payload'

/**
 * Hvilket felt på hver block-type der skal vises som rækkelabel i admin,
 * så en side med mange blocks er til at læse i listen frem for "Untitled".
 * Udfyldes efterhånden som nye blocks bygges.
 */
export const BLOCK_ROW_LABELS: Record<string, string> = {}

/**
 * Sætter RowLabel-komponenten på alle blocks på én gang ud fra
 * BLOCK_ROW_LABELS, så den ikke skal gentages i hver enkelt block-fil.
 */
export function prepareBlocks(blocks: Block[]): Block[] {
  return blocks.map((block) => {
    if (!BLOCK_ROW_LABELS[block.slug]) return block

    return {
      ...block,
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
