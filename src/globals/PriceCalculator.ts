import type { Field, GlobalConfig, TextField } from 'payload'

import { POSTCODE_COORDINATES } from '../lib/postcodes'

/** Postnummer som tekst (så 0800 og lignende bevares), som skal findes i postnummerlisten. */
const postcodeField = (name: string, label: string): TextField => ({
  name,
  type: 'text',
  label,
  required: true,
  validate: (value: null | string | undefined) =>
    value && POSTCODE_COORDINATES[value.trim()] ? true : 'Enter a valid Danish postcode with 4 digits.',
})

/** Tillæg for et tidsrum: enten et fast beløb eller en procentdel af prisen før kørsel og moms. */
const surchargeGroup = (name: string, label: string, description: string): Field => ({
  name,
  type: 'group',
  label,
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Surcharge type',
          defaultValue: 'amount',
          options: [
            { label: 'Fixed amount (kr.)', value: 'amount' },
            { label: 'Percent of the price', value: 'percent' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'value',
          type: 'number',
          label: 'Surcharge',
          min: 0,
          admin: { width: '50%', description: 'Leave empty for no surcharge.' },
        },
      ],
    },
  ],
})

/**
 * Generelle priser og regler til prisberegneren. Selve ydelserne ligger i samlingen "Price calculator services".
 * Alle beløb er ekskl. moms og starter tomme: de skal komme fra Din Låsesmeds egen prisliste.
 */
export const PriceCalculator: GlobalConfig = {
  slug: 'priceCalculator',
  label: 'Price calculator',
  admin: {
    group: 'Price calculator',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'hourlyRate',
                  type: 'number',
                  label: 'Hourly rate (kr.)',
                  min: 0,
                  admin: { width: '50%', description: 'Used for the estimated time on each service.' },
                },
                {
                  name: 'callOutFee',
                  type: 'number',
                  label: 'Call-out fee (kr.)',
                  min: 0,
                  admin: { width: '50%', description: 'Added once per visit, for services that include a call-out.' },
                },
              ],
            },
            {
              name: 'priceRangePercent',
              type: 'number',
              label: 'Price range (+/- %)',
              min: 0,
              max: 100,
              admin: {
                description: 'The price is shown as a range around the calculated price. E.g. 15 gives 850 to 1.150 kr. for a price of 1.000 kr.',
              },
            },
            {
              name: 'disclaimer',
              type: 'textarea',
              label: 'Disclaimer',
              admin: { description: 'Shown under the price, e.g. that the price is indicative and the final price is agreed on site.' },
            },
          ],
        },
        {
          label: 'VAT',
          description: 'Private customers see prices including VAT. Business customers see prices excluding VAT.',
          fields: [
            {
              name: 'vatPercent',
              type: 'number',
              label: 'VAT (%)',
              defaultValue: 25,
              min: 0,
              max: 100,
            },
          ],
        },
        {
          label: 'Time surcharges',
          description: 'The customer chooses when the job should be done. The surcharge is added before driving and VAT.',
          fields: [
            surchargeGroup('eveningNight', 'Evening and night (on-call service)', 'On-call service 16.00 to 08.00 on weekdays.'),
            surchargeGroup('weekendHoliday', 'Weekend and public holidays', 'All day on Saturdays, Sundays and public holidays.'),
          ],
        },
        {
          label: 'Driving',
          description:
            'The customer enters a postcode. The calculator measures the distance (as the crow flies) from the middle of the postcode to the nearest department and multiplies it by the price per km.',
          fields: [
            {
              name: 'departments',
              type: 'array',
              label: 'Departments',
              labels: { singular: 'Department', plural: 'Departments' },
              admin: { description: 'Where we drive from. The postcode is used as the location.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', label: 'Name', required: true, admin: { width: '50%', description: 'E.g. Aarhus.' } },
                    { ...postcodeField('postcode', 'Postcode'), admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'pricePerKm', type: 'number', label: 'Price per km (kr.)', min: 0, admin: { width: '50%' } },
                {
                  name: 'maxKm',
                  type: 'number',
                  label: 'Max distance (km)',
                  min: 0,
                  admin: { width: '50%', description: 'Farther away shows the text below instead of a price. Empty for no limit.' },
                },
              ],
            },
            {
              name: 'exceptions',
              type: 'array',
              label: 'Exceptions',
              labels: { singular: 'Exception', plural: 'Exceptions' },
              admin: {
                description: 'Postcodes where the distance does not fit, e.g. islands that need a ferry. They get a fixed price or the text below.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { ...postcodeField('postcode', 'Postcode'), admin: { width: '30%' } },
                    { name: 'name', type: 'text', label: 'Name', admin: { width: '30%', description: 'For yourself, e.g. Samsø.' } },
                    {
                      name: 'surcharge',
                      type: 'number',
                      label: 'Driving (kr.)',
                      min: 0,
                      admin: { width: '40%', description: 'Leave empty to show the text below instead of a price.' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'outsideAreaText',
              type: 'textarea',
              label: 'Text when driving has no price',
              admin: { description: 'E.g. that we also come there, but the price for driving is agreed by phone.' },
            },
          ],
        },
      ],
    },
  ],
}
