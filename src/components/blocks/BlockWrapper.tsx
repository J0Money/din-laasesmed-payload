import type React from 'react'

import { SPACING_AFTER_CLASSES, SPACING_BEFORE_CLASSES, type SpacingSize } from '@/blocks/fields/spacing'
import { MUTED_BACKGROUND_CLASS } from '@/blocks/fields/surface'

type BlockWrapperProps = {
  blockClass?: null | string
  children: React.ReactNode
  mutedBackground?: boolean | null
  spacingAfter?: null | SpacingSize
  spacingBefore?: null | SpacingSize
}

/**
 * Lægger spacing- og surface-klasserne fra layoutTab() omkring en blocks
 * indhold. Alle blocks der bruger layoutTab()/layoutTabSpacingOnly() skal
 * rendres gennem denne, så reglerne kun findes ét sted.
 */
export function BlockWrapper({
  blockClass,
  children,
  mutedBackground,
  spacingAfter = 'md',
  spacingBefore = 'md',
}: BlockWrapperProps) {
  const classes = [
    SPACING_BEFORE_CLASSES[spacingBefore ?? 'md'],
    SPACING_AFTER_CLASSES[spacingAfter ?? 'md'],
    mutedBackground ? MUTED_BACKGROUND_CLASS : '',
    blockClass || '',
  ]
    .filter(Boolean)
    .join(' ')

  return <section className={classes}>{children}</section>
}
