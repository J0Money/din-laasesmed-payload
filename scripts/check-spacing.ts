// Fails loudly when the spacing scale or the block list drift apart.
// Run: pnpm check:spacing
import type { Block, Field } from 'payload'

// The config must load first: blocks import the Payload client, which imports the config, which imports the blocks.
import '../src/payload.config'
import { allBlocks } from '../src/blocks'
import {
  BLOCK_SPACING,
  SPACING_AFTER_CLASSES,
  SPACING_BEFORE_CLASSES,
  type SpacingSize,
  spacingClasses,
} from '../src/blocks/fields/spacing'

/** Blocks that draw their own vertical space as part of the design and have no spacing tab. */
const NO_SPACING = ['homeHero', 'videoHero', 'homeStats', 'contactCards']

const SIZES: SpacingSize[] = ['none', 'small', 'medium', 'large']
const errors: string[] = []

const hasSpacingField = (fields: Field[]): boolean =>
  fields.some((field) =>
    ('name' in field && field.name === 'spacingBefore') ||
    ('tabs' in field && field.tabs.some((tab) => hasSpacingField(tab.fields))) ||
    ('fields' in field && field.type !== 'array' && hasSpacingField(field.fields)),
  )

for (const size of SIZES) {
  const before = SPACING_BEFORE_CLASSES[size]
  const after = SPACING_AFTER_CLASSES[size]
  if (!before.includes('pt-') || !after.includes('pb-'))
    errors.push(`"${size}" har forkerte klasser: "${before}" / "${after}"`)
  else console.log(`  ${size.padEnd(8)} ${before} / ${after}`)
}

for (const block of allBlocks as Block[]) {
  const listed = block.slug in BLOCK_SPACING
  const field = hasSpacingField(block.fields)
  if (NO_SPACING.includes(block.slug)) {
    if (listed || field) errors.push(`${block.slug} står i NO_SPACING men har spacing`)
  } else if (!listed || !field) {
    errors.push(`${block.slug} mangler ${listed ? 'spacing-fanen' : 'en linje i BLOCK_SPACING'}`)
  } else {
    // The block's own choices, and an empty value from before the fields existed, must render with no override.
    const own = BLOCK_SPACING[block.slug]
    if (spacingClasses(block.slug, own.before, own.after) || spacingClasses(block.slug, null, null))
      errors.push(`${block.slug} får overstyret sin egen luft`)
  }
}
for (const slug of Object.keys(BLOCK_SPACING))
  if (!(allBlocks as Block[]).some((block) => block.slug === slug)) errors.push(`BLOCK_SPACING har "${slug}", som ikke er en blok`)

if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`)
  console.error('\nSpacing-tjek fejlede.')
  process.exit(1)
}
console.log('\nSpacing-tjek bestået.')
