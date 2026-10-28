import type { CollectionConfig } from 'payload'

/**
 * Ledige stillinger til jobliste-blokken. Originalens liste er en CMS-collection, der er tom i dag
 * ("Der er ingen artikler."), så felterne her er et bud på det, en stillingsannonce skal bruge.
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job', plural: 'Open positions' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
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
      label: 'Title',
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      admin: { description: 'E.g.: Aarhus or Aalborg.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Short description',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Job description',
    },
    {
      name: 'applyEmail',
      type: 'email',
      label: 'Send applications to',
      admin: { description: 'Leave empty to use the company email.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Posted',
      admin: {
        position: 'sidebar',
        description: 'The newest job is shown first.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
