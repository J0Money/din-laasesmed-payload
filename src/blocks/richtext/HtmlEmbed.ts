import type { Block } from 'payload'

/**
 * HTML der indsættes præcis som skrevet i rich text (som Webflows "Embed"), fx en tabel med egen stil.
 * Avanceret og kun til betroede redaktører: koden vises ufiltreret på siden.
 */
export const htmlEmbedBlock: Block = {
  slug: 'htmlEmbed',
  interfaceName: 'HtmlEmbedBlock',
  labels: { singular: 'HTML-kode', plural: 'HTML-kode' },
  fields: [
    {
      name: 'html',
      type: 'textarea',
      required: true,
      label: 'HTML',
      admin: {
        rows: 12,
        description: 'Indsættes uændret på siden, fx en <table> med en <style> foran. Kun til avancerede redaktører.',
      },
    },
  ],
}
