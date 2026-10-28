import type { Field } from 'payload'

/** The original site's section-space scale (Webflow variables none, small, main and large). */
export type SpacingSize = 'large' | 'medium' | 'none' | 'small'

type BlockSpacing = { after: SpacingSize; before: SpacingSize }

/**
 * Each block's own top and bottom padding on the scale, used as the default so pages match the original.
 * Blocks missing here (heroes, video band, stats band, contact cards) have no spacing tab.
 */
export const BLOCK_SPACING: Record<string, BlockSpacing> = {
  articleWithForm: { before: 'small', after: 'small' },
  brandGrid: { before: 'none', after: 'small' },
  formPage: { before: 'small', after: 'small' },
  homeCustomers: { before: 'small', after: 'small' },
  homeFocusCards: { before: 'small', after: 'small' },
  homeIntro: { before: 'small', after: 'small' },
  homeTestimonials: { before: 'small', after: 'small' },
  imageSlider: { before: 'small', after: 'small' },
  jobList: { before: 'none', after: 'small' },
  overviewIntro: { before: 'small', after: 'medium' },
  parallaxBand: { before: 'medium', after: 'medium' },
  people: { before: 'small', after: 'small' },
  text: { before: 'small', after: 'small' },
  textWithImage: { before: 'small', after: 'small' },
  thanksMessage: { before: 'small', after: 'small' },
}

const SPACING_LABELS: Record<SpacingSize, string> = {
  large: 'Large',
  medium: 'Medium',
  none: 'None',
  small: 'Small',
}

/*
 * Overrides of the padding on the block's root element. BlockRenderer puts these classes on a
 * `display: contents` wrapper, so `*:` reaches the block's <section>.
 */
export const SPACING_BEFORE_CLASSES: Record<SpacingSize, string> = {
  large: '*:pt-(--fluid-section-lg)!',
  medium: '*:pt-(--fluid-pad)!',
  none: '*:pt-0!',
  small: '*:pt-(--fluid-section)!',
}

export const SPACING_AFTER_CLASSES: Record<SpacingSize, string> = {
  large: '*:pb-(--fluid-section-lg)!',
  medium: '*:pb-(--fluid-pad)!',
  none: '*:pb-0!',
  small: '*:pb-(--fluid-section)!',
}

/** Override classes for a block, empty when its choices are its own padding (also for blocks saved before the fields existed). */
export function spacingClasses(blockType: string, before?: null | string, after?: null | string): string {
  const own = BLOCK_SPACING[blockType]
  if (!own) return ''
  const override = (value: null | string | undefined, fallback: SpacingSize, classes: Record<SpacingSize, string>) =>
    value && value in SPACING_LABELS && value !== fallback ? classes[value as SpacingSize] : ''
  return [override(before, own.before, SPACING_BEFORE_CLASSES), override(after, own.after, SPACING_AFTER_CLASSES)]
    .filter(Boolean)
    .join(' ')
}

const DESCRIPTION =
  'Same scale as the original site: Small 80px, Medium 112px and Large 160px on large screens, smaller on mobile.'

const SPACING_OPTIONS = (['none', 'small', 'medium', 'large'] as SpacingSize[]).map((value) => ({
  label: SPACING_LABELS[value],
  value,
}))

/** Luft over/under til en blocks layout-fane, med blokkens egen luft som standard. */
export function spacingFields(blockType: string): Field[] {
  const own = BLOCK_SPACING[blockType]
  if (!own) throw new Error(`Blokken "${blockType}" mangler i BLOCK_SPACING`)
  return [
    {
      name: 'spacingBefore',
      type: 'select',
      label: 'Space above',
      defaultValue: own.before,
      options: SPACING_OPTIONS,
      admin: { description: `The space at the top of the section. ${DESCRIPTION}` },
    },
    {
      name: 'spacingAfter',
      type: 'select',
      label: 'Space below',
      defaultValue: own.after,
      options: SPACING_OPTIONS,
      admin: { description: `The space at the bottom of the section. ${DESCRIPTION}` },
    },
  ]
}
