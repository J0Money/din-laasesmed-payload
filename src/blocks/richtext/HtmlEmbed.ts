import type { Block } from 'payload'

/**
 * HTML der indsættes præcis som skrevet i rich text (som Webflows "Embed"), fx en tabel med egen stil.
 * Avanceret og kun til betroede redaktører: koden vises ufiltreret på siden.
 */
export const htmlEmbedBlock: Block = {
  slug: 'htmlEmbed',
  interfaceName: 'HtmlEmbedBlock',
  labels: { singular: 'HTML code', plural: 'HTML code' },
  fields: [
    {
      name: 'html',
      type: 'textarea',
      required: true,
      label: 'HTML',
      admin: {
        rows: 12,
        description: 'Inserted unchanged on the page, e.g. a <table> with a <style> in front. For advanced editors only.',
      },
    },
  ],
}
