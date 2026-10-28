import type { Field } from 'payload'

/** Blocks der selv tegner en fuldbredde-baggrund og derfor ikke skal have et muted-felt. */
export const FULL_BLEED_BLOCKS = ['hero']

export const MUTED_BACKGROUND_CLASS = 'bg-surface-muted'

export function surfaceField(): Field {
  return {
    name: 'mutedBackground',
    type: 'checkbox',
    label: 'Muted background',
    defaultValue: false,
    admin: {
      description:
        'Gives the section a muted gray background instead of the default one. Use it to create visual separation between sections.',
    },
  }
}

/**
 * Sætter automatisk ekstra luft, når to blocks med forskellig flade (lys/dæmpet)
 * støder op mod hinanden, så overgangen ikke ser klemt ud.
 */
export function surfaceAwareSpacing(
  current: { mutedBackground?: boolean | null },
  previous: { mutedBackground?: boolean | null } | undefined,
): boolean {
  if (!previous) return false
  return Boolean(current.mutedBackground) !== Boolean(previous.mutedBackground)
}
