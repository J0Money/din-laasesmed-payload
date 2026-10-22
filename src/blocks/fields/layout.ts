import type { Field, Tab } from 'payload'

import { type SpacingSize, spacingFields } from './spacing'
import { surfaceField } from './surface'

type LayoutTabOptions = {
  afterDefault?: SpacingSize
  beforeDefault?: SpacingSize
}

/**
 * Standard layout-fane: spacing (før/efter) + dæmpet baggrund + en avanceret
 * CSS-klasse. Bruges af de fleste blocks som sidste fane.
 */
export function layoutTab(options: LayoutTabOptions = {}): Tab {
  return {
    label: 'Layout',
    fields: [...spacingFields(options), surfaceField(), blockClassField()],
  }
}

/**
 * Kun spacing, intet muted-felt — til inset-bånd der altid har deres egen
 * faste flade (fx search, crossSell).
 */
export function layoutTabSpacingOnly(options: LayoutTabOptions = {}): Tab {
  return {
    label: 'Layout',
    fields: [...spacingFields(options)],
  }
}

/**
 * Kun den avancerede CSS-klasse — til blocks der selv styrer deres lodrette
 * luft (fx hero, der fylder hele viewporten).
 */
export function layoutTabBlockClassOnly(): Tab {
  return {
    label: 'Layout',
    fields: [blockClassField()],
  }
}

function blockClassField(): Field {
  return {
    name: 'blockClass',
    type: 'text',
    label: 'Ekstra CSS-klasse (avanceret)',
    admin: {
      description: 'Valgfrit — bruges kun til særlige layout-behov, ikke til almindelig indholdsredigering.',
    },
  }
}
