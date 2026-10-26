import type { Field, Tab } from 'payload'

import { spacingFields } from './spacing'
import { surfaceField } from './surface'

/**
 * Standard layout-fane: spacing (før/efter) + dæmpet baggrund + en avanceret
 * CSS-klasse. Til de generelle blokke, der ikke selv har en fast flade.
 */
export function layoutTab(blockType: string): Tab {
  return {
    label: 'Layout',
    fields: [...spacingFields(blockType), surfaceField(), blockClassField()],
  }
}

/**
 * Kun spacing, intet muted-felt. Til blokke der altid tegner deres egen
 * faste flade, som originalens sektioner.
 */
export function layoutTabSpacingOnly(blockType: string): Tab {
  return {
    label: 'Layout',
    fields: [...spacingFields(blockType)],
  }
}

/**
 * Lægger en blocks egne felter i fanen "Indhold" og spacing i fanen "Layout".
 * Fanerne er unavngivne, så felterne ligger stadig på blokkens rod i databasen.
 */
export function contentWithSpacingTabs(blockType: string, fields: Field[]): Field[] {
  return [
    {
      type: 'tabs',
      tabs: [{ label: 'Indhold', fields }, layoutTabSpacingOnly(blockType)],
    },
  ]
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
