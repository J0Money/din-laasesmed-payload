import type { Block, Field } from 'payload'

/**
 * Udvidelser af form builder-pluginet, så formularerne kan gengive originalens:
 * - pladsholdertekst (pluginets select har den allerede, de andre felter har ikke)
 * - "fed label", fordi originalen blander normal og medium vægt på labels
 * - "vis kun når": et felt vises først, når et afkrydsningsfelt er markeret (leveringsfelterne i Nøgleformularen)
 * - overskrift og undertekst til kort-formularen, og en fejlbesked pr. formular
 */
const withPlaceholder = ['text', 'email', 'number', 'textarea']
const extendable = [...withPlaceholder, 'select', 'checkbox', 'radio']

const extraFields = (blockSlug: string): Field[] => [
  ...(withPlaceholder.includes(blockSlug)
    ? ([{ name: 'placeholder', type: 'text', label: 'Placeholder text' }] as Field[])
    : []),
  { name: 'mediumLabel', type: 'checkbox', label: 'Bold label (medium weight)', defaultValue: false },
  {
    name: 'showWhen',
    type: 'text',
    label: 'Only show when this checkbox is checked',
    admin: {
      description: 'Enter the field name of the checkbox, e.g. "levering". Leave empty to always show the field.',
    },
  },
]

function extendBlock(block: Block): Block {
  if (!extendable.includes(block.slug)) return block
  const existing = new Set(block.fields.map((field) => ('name' in field ? field.name : '')))
  return { ...block, fields: [...block.fields, ...extraFields(block.slug).filter((field) => !('name' in field) || !existing.has(field.name))] }
}

const formExtras: Field[] = [
  {
    name: 'heading',
    type: 'text',
    label: 'Heading (card form)',
    admin: { description: 'Used when the form is shown as a card next to an article.' },
  },
  { name: 'subheading', type: 'text', label: 'Subheading (card form)' },
  {
    name: 'errorMessage',
    type: 'text',
    label: 'Error message',
    defaultValue: 'Noget gik galt, prøv igen eller ring til os.',
  },
]

export function extendFormFields({ defaultFields }: { defaultFields: Field[] }): Field[] {
  const extended = defaultFields.map((field) => {
    if ('name' in field && field.name === 'fields' && field.type === 'blocks') {
      return { ...field, blocks: (field.blocks as Block[]).map(extendBlock) } as Field
    }
    return field
  })
  return [...extended, ...formExtras]
}
