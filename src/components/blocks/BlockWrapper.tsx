import type React from 'react'

import { MUTED_BACKGROUND_CLASS } from '@/blocks/fields/surface'

type BlockWrapperProps = {
  blockClass?: null | string
  children: React.ReactNode
  mutedBackground?: boolean | null
}

/**
 * Sektion med standardluft og surface-klasserne fra layoutTab() til de generelle blokke.
 * Luft før/efter lægges på af BlockRenderer, ligesom for alle andre blokke.
 */
export function BlockWrapper({ blockClass, children, mutedBackground }: BlockWrapperProps) {
  const classes = ['py-(--fluid-section)', mutedBackground ? MUTED_BACKGROUND_CLASS : '', blockClass || '']
    .filter(Boolean)
    .join(' ')

  return <section className={classes}>{children}</section>
}
