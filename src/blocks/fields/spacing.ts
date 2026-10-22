import type { Field } from 'payload'

export type SpacingSize = 'lg' | 'md' | 'none' | 'sm'

const SPACING_LABELS: Record<SpacingSize, string> = {
  lg: 'Stor',
  md: 'Mellem',
  none: 'Ingen',
  sm: 'Lille',
}

/** Tailwind-klasser pr. spacing-størrelse. Delt mellem admin-forhåndsvisning og frontend. */
export const SPACING_BEFORE_CLASSES: Record<SpacingSize, string> = {
  lg: 'mt-24',
  md: 'mt-16',
  none: 'mt-0',
  sm: 'mt-8',
}

export const SPACING_AFTER_CLASSES: Record<SpacingSize, string> = {
  lg: 'mb-24',
  md: 'mb-16',
  none: 'mb-0',
  sm: 'mb-8',
}

const SPACING_OPTIONS = (Object.keys(SPACING_LABELS) as SpacingSize[]).map((value) => ({
  label: SPACING_LABELS[value],
  value,
}))

type SpacingFieldsOptions = {
  afterDefault?: SpacingSize
  beforeDefault?: SpacingSize
}

/**
 * before/after-felter til en blocks layout-fane. Hver block-type sætter sine
 * egne defaults — en hero har typisk `afterDefault: 'none'`, en standardblok
 * `afterDefault: 'md'`.
 */
export function spacingFields({
  afterDefault = 'md',
  beforeDefault = 'md',
}: SpacingFieldsOptions = {}): Field[] {
  return [
    {
      name: 'spacingBefore',
      type: 'select',
      label: 'Luft før',
      defaultValue: beforeDefault,
      options: SPACING_OPTIONS,
      admin: {
        description: 'Afstand til sektionen ovenfor.',
      },
    },
    {
      name: 'spacingAfter',
      type: 'select',
      label: 'Luft efter',
      defaultValue: afterDefault,
      options: SPACING_OPTIONS,
      admin: {
        description: 'Afstand til sektionen nedenfor.',
      },
    },
  ]
}
