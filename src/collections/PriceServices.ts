import type { CollectionConfig } from 'payload'

type Data = { pricingModel?: 'perUnit' | 'fromPrice' | 'inStore' }

// Tillæg og udkald giver kun mening, når prisen regnes.
const isCalculated = (data: Data) => data?.pricingModel !== 'fromPrice' && data?.pricingModel !== 'inStore'

const isModel = (model: Data['pricingModel']) => (data: Data) => data?.pricingModel === model

/**
 * Ydelser i prisberegneren. Prisen regnes som udkald + tid × timepris + materialer + tilvalg, derefter tidstillæg, kørsel og moms
 * (timepris, udkald, tillæg og zoner står i globalen "Price calculator"). Ydelser med fra-pris kræver besigtigelse og sendes til formularen.
 */
export const PriceServices: CollectionConfig = {
  slug: 'priceServices',
  labels: { singular: 'Service', plural: 'Price calculator services' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: 'Price calculator',
    defaultColumns: ['name', 'category', 'pricingModel', 'enabled'],
    description: 'The services customers can choose in the price calculator. Drag to change the order. All amounts are excluding VAT.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      admin: { description: 'E.g.: Change of lock cylinder. Shown to the customer.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Category',
      options: [
        { label: 'Emergency', value: 'emergency' },
        { label: 'Mechanical security', value: 'mechanical' },
        { label: 'Electronic security', value: 'electronic' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short description',
      maxLength: 200,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
    {
      name: 'pricingModel',
      type: 'select',
      required: true,
      label: 'Pricing model',
      defaultValue: 'perUnit',
      options: [
        { label: 'Price per unit and time', value: 'perUnit' },
        { label: 'From price, requires inspection', value: 'fromPrice' },
        { label: 'In store, no price', value: 'inStore' },
      ],
      admin: {
        description:
          'With "From price" only "from X kr." is shown, and the customer is sent to the quote form. With "In store" the text below is shown instead of a price.',
      },
    },
    // Stykpris
    {
      type: 'row',
      admin: { condition: isModel('perUnit') },
      fields: [
        {
          name: 'unit',
          type: 'select',
          label: 'Unit',
          defaultValue: 'piece',
          options: [
            { label: 'Piece (stk.)', value: 'piece' },
            { label: 'Door (dør)', value: 'door' },
            { label: 'Key (nøgle)', value: 'key' },
            { label: 'Window (vindue)', value: 'window' },
            { label: 'Lock (lås)', value: 'lock' },
          ],
          admin: { width: '34%' },
        },
        { name: 'minQuantity', type: 'number', label: 'Min. quantity', defaultValue: 1, min: 1, admin: { width: '33%' } },
        { name: 'maxQuantity', type: 'number', label: 'Max. quantity', defaultValue: 10, min: 1, admin: { width: '33%' } },
      ],
    },
    {
      type: 'row',
      admin: { condition: isModel('perUnit') },
      fields: [
        { name: 'unitPrice', type: 'number', label: 'Material price per unit (kr.)', min: 0, admin: { width: '50%' } },
        {
          name: 'minutesPerUnit',
          type: 'number',
          label: 'Minutes per unit',
          min: 0,
          admin: { width: '50%', description: 'Mounting time, multiplied by the hourly rate.' },
        },
      ],
    },
    // Fra-pris
    {
      name: 'fromPrice',
      type: 'number',
      label: 'From price (kr.)',
      min: 0,
      admin: { condition: isModel('fromPrice') },
    },
    // I butikken
    {
      name: 'storeText',
      type: 'textarea',
      label: 'Text instead of a price',
      admin: {
        condition: isModel('inStore'),
        description: 'Shown in the price box when the service is chosen, e.g. that the customer can come to the store and see the selection.',
      },
    },
    {
      name: 'includeCallOutFee',
      type: 'checkbox',
      label: 'Include call-out fee',
      defaultValue: true,
      admin: {
        condition: isCalculated,
        description: 'The call-out fee is only added once, even if the customer chooses several services.',
      },
    },
    {
      name: 'chooseOneOption',
      type: 'checkbox',
      label: 'Customer must choose one add-on',
      defaultValue: false,
      admin: {
        condition: isCalculated,
        description: 'The add-ons become a choice of exactly one, and the price is shown when one is chosen.',
      },
    },
    {
      name: 'options',
      type: 'array',
      label: 'Add-ons',
      labels: { singular: 'Add-on', plural: 'Add-ons' },
      admin: {
        condition: isCalculated,
        description: 'Choices the customer can tick, e.g. "Approved security cylinder" or "Same key for all doors".',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: 'Name', required: true, admin: { width: '40%' } },
            { name: 'price', type: 'number', label: 'Price (kr.)', min: 0, admin: { width: '20%' } },
            {
              name: 'perUnit',
              type: 'checkbox',
              label: 'Per unit',
              defaultValue: false,
              admin: { width: '20%', description: 'Multiplied by the quantity.' },
            },
            {
              name: 'showFromQuantity',
              type: 'number',
              label: 'Show from quantity',
              min: 2,
              admin: { width: '20%', description: 'E.g. 2: only shown when the customer has chosen 2 or more. Empty: always.' },
            },
            {
              name: 'requiresQuote',
              type: 'checkbox',
              label: 'No price, customer contacts us',
              defaultValue: false,
              admin: { width: '20%', description: 'If chosen, no price is calculated for the service. The customer is asked to ask for a quote.' },
            },
          ],
        },
      ],
    },
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Show in the price calculator',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Turn off to hide the service without deleting it.' },
    },
    {
      name: 'customerTypes',
      type: 'select',
      hasMany: true,
      label: 'Customer types',
      defaultValue: ['private', 'business'],
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Business', value: 'business' },
      ],
      admin: { position: 'sidebar', description: 'Who can choose the service.' },
    },
  ],
}
