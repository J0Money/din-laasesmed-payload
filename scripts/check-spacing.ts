import { SPACING_AFTER_CLASSES, SPACING_BEFORE_CLASSES, type SpacingSize } from '../src/blocks/fields/spacing'

const SIZES: SpacingSize[] = ['none', 'sm', 'md', 'lg']

function classToPx(tailwindClass: string): number {
  const match = tailwindClass.match(/-(\d+)$/)
  if (!match) throw new Error(`Kan ikke aflæse spacing-tal fra klassen "${tailwindClass}"`)
  return Number(match[1]) * 4
}

let hasError = false

console.log('Spacing-skala (før/efter):\n')

for (const size of SIZES) {
  const before = SPACING_BEFORE_CLASSES[size]
  const after = SPACING_AFTER_CLASSES[size]

  if (!before || !after) {
    console.error(`✗ Størrelsen "${size}" mangler en klasse i spacing.ts`)
    hasError = true
    continue
  }

  const beforePx = classToPx(before)
  const afterPx = classToPx(after)

  if (beforePx !== afterPx) {
    console.error(
      `✗ "${size}" er ikke symmetrisk: før = ${beforePx}px (${before}), efter = ${afterPx}px (${after})`,
    )
    hasError = true
    continue
  }

  console.log(`  ${size.padEnd(4)} → ${before} / ${after}  (${beforePx}px)`)
}

// Skalaen skal stige — en fejl her betyder typisk en tastefejl i spacing.ts.
for (let i = 1; i < SIZES.length; i++) {
  const prev = classToPx(SPACING_BEFORE_CLASSES[SIZES[i - 1]])
  const current = classToPx(SPACING_BEFORE_CLASSES[SIZES[i]])
  if (SIZES[i] !== 'none' && current <= prev) {
    console.error(`✗ Skalaen stiger ikke korrekt mellem "${SIZES[i - 1]}" og "${SIZES[i]}"`)
    hasError = true
  }
}

if (hasError) {
  console.error('\nSpacing-tjek fejlede.')
  process.exit(1)
}

console.log('\nSpacing-tjek bestået.')
