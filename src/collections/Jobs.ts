import type { CollectionConfig } from 'payload'

/**
 * Ledige stillinger til jobliste-blokken. Originalens liste er en CMS-collection, der er tom i dag
 * ("Der er ingen artikler."), så felterne her er et bud på det, en stillingsannonce skal bruge.
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Stilling', plural: 'Ledige stillinger' },
  admin: {
    useAsTitle: 'title',
    group: 'Indhold',
    defaultColumns: ['title', 'location', '_status', 'publishedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titel',
    },
    {
      name: 'location',
      type: 'text',
      label: 'Arbejdssted',
      admin: { description: 'F.eks.: Aarhus eller Aalborg.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Kort beskrivelse',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Stillingsbeskrivelse',
    },
    {
      name: 'applyEmail',
      type: 'email',
      label: 'Send ansøgning til',
      admin: { description: 'Lad stå tom for at bruge virksomhedens e-mail.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Opslået',
      admin: {
        position: 'sidebar',
        description: 'Nyeste stilling vises først.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
