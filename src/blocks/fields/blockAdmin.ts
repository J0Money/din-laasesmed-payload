import type { Block } from 'payload'

/**
 * Genererer admin.description til et blocks-felt ud fra blokkenes egne labels,
 * så listen aldrig forældes, når der tilføjes eller fjernes en block.
 */
export function blocksAdminDescription(blocks: Block[]): string {
  const names = blocks.map((block) =>
    typeof block.labels?.singular === 'string' ? block.labels.singular : block.slug,
  )
  return `Choose from: ${names.join(', ')}.`
}
