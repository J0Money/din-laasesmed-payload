import type { Field } from 'payload'

/** Blocks der selv tegner en fuldbredde-baggrund og derfor ikke skal have et muted-felt. */
export const FULL_BLEED_BLOCKS = ['hero']

export const MUTED_BACKGROUND_CLASS = 'bg-surface-muted'

export function surfaceField(): Field {
  return {
    name: 'mutedBackground',
    type: 'checkbox',
    label: 'Dæmpet baggrund',
    defaultValue: false,
    admin: {
      description:
        'Giver sektionen en dæmpet grå baggrund i stedet for standardbaggrunden — brug til at skabe visuel adskillelse mellem sektioner.',
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
