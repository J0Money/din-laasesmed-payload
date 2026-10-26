import type { Field } from 'payload'

/** The original site's section-space scale (Webflow variables), plus "standard" for blocks with their own padding. */
export type SpacingSize = 'large' | 'main' | 'none' | 'small' | 'standard'

type BlockSpacing = { after: SpacingSize; before: SpacingSize }

/**
 * Each block's own top and bottom padding, expressed on the scale. "standard" means the block draws
 * padding that is not a step on the scale (e.g. People's extra 20px), so it is kept unless overridden.
 * Blocks missing here (heroes, video band, stats band, contact cards) have no spacing tab.
 */
export const BLOCK_SPACING: Record<string, BlockSpacing> = {
  articleWithForm: { before: 'small', after: 'small' },
  brandGrid: { before: 'standard', after: 'small' },
  formPage: { before: 'small', after: 'small' },
  homeCustomers: { before: 'small', after: 'small' },
  homeFocusCards: { before: 'small', after: 'small' },
  homeIntro: { before: 'small', after: 'small' },
  homeTestimonials: { before: 'standard', after: 'standard' },
  imageSlider: { before: 'small', after: 'small' },
  jobList: { before: 'standard', after: 'small' },
  overviewIntro: { before: 'small', after: 'main' },
  parallaxBand: { before: 'main', after: 'main' },
  people: { before: 'standard', after: 'small' },
  text: { before: 'small', after: 'small' },
  textWithImage: { before: 'small', after: 'small' },
  thanksMessage: { before: 'small', after: 'small' },
}

const SPACING_LABELS: Record<SpacingSize, string> = {
  large: 'Large',
  main: 'Main',
  none: 'Ingen',
  small: 'Small',
  standard: 'Standard',
}

/*
 * Overrides of the padding on the block's root element. BlockRenderer puts these classes on a
 * `display: contents` wrapper, so `*:` reaches the block's <section>. "standard" never overrides.
 */
export const SPACING_BEFORE_CLASSES: Record<SpacingSize, string> = {
  large: '*:pt-(--fluid-section-lg)!',
  main: '*:pt-(--fluid-pad)!',
  none: '*:pt-0!',
  small: '*:pt-(--fluid-section)!',
  standard: '',
}

export const SPACING_AFTER_CLASSES: Record<SpacingSize, string> = {
  large: '*:pb-(--fluid-section-lg)!',
  main: '*:pb-(--fluid-pad)!',
  none: '*:pb-0!',
  small: '*:pb-(--fluid-section)!',
  standard: '',
}

/** Override classes for a block, empty when its choices are its own padding (also for blocks saved before the fields existed). */
export function spacingClasses(blockType: string, before?: null | string, after?: null | string): string {
  const own = BLOCK_SPACING[blockType]
  if (!own) return ''
  const pick = (value: null | string | undefined, fallback: SpacingSize) =>
    value && value in SPACING_LABELS && value !== fallback ? (value as SpacingSize) : 'standard'
  return [SPACING_BEFORE_CLASSES[pick(before, own.before)], SPACING_AFTER_CLASSES[pick(after, own.after)]]
    .filter(Boolean)
    .join(' ')
}

const DESCRIPTION =
  'Samme skala som originalen: Small 80px, Main 112px og Large 160px på store skærme, mindre på mobil.'

function options(own: SpacingSize) {
  const sizes: SpacingSize[] = own === 'standard' ? ['standard', 'none', 'small', 'main', 'large'] : ['none', 'small', 'main', 'large']
  return sizes.map((value) => ({ label: SPACING_LABELS[value], value }))
}

/** Luft over/under til en blocks layout-fane, med blokkens egen luft som standard. */
export function spacingFields(blockType: string): Field[] {
  const own = BLOCK_SPACING[blockType]
  if (!own) throw new Error(`Blokken "${blockType}" mangler i BLOCK_SPACING`)
  return [
    {
      name: 'spacingBefore',
      type: 'select',
      label: 'Luft over',
      defaultValue: own.before,
      options: options(own.before),
      admin: { description: `Luften i toppen af sektionen. ${DESCRIPTION}` },
    },
    {
      name: 'spacingAfter',
      type: 'select',
      label: 'Luft under',
      defaultValue: own.after,
      options: options(own.after),
      admin: { description: `Luften i bunden af sektionen. ${DESCRIPTION}` },
    },
  ]
}
