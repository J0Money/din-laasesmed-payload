import type { CollectionConfig } from 'payload'

type Data = { pricingModel?: 'fromPrice' | 'inStore' | 'perUnit' | 'priceRange' }

const isModel = (model: Data['pricingModel']) => (data: Data) => data?.pricingModel === model

/**
 * Ydelser i prisberegneren. Prisen regnes som akutgebyr (kun akut) + tid × timepris + materialer + tilvalg, derefter tidstillæg, kørsel og moms
 * (timepris, akutgebyr, tillæg og kørsel står i globalen "Price calculator"). Ydelser med fra-pris eller prisinterval kræver besigtigelse og sendes til formularen.
 */
export const PriceServices: CollectionConfig = {
  slug: 'priceServices',
  labels: { singular: 'Service', plural: 'Price calculator services' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: 'Price calculator',
    defaultColumns: ['name', 'category', 'pricingModel', 'enabled'],
    description: 'Services in the price calculator. Drag to change the order. Amounts are excluding VAT.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      admin: { description: 'Shown to the customer.' },
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
      name: 'pricingModel',
      type: 'select',
      required: true,
      label: 'Pricing model',
      defaultValue: 'perUnit',
      options: [
        { label: 'Price per unit and time', value: 'perUnit' },
        { label: 'From price, requires inspection', value: 'fromPrice' },
        { label: 'Price range, requires inspection', value: 'priceRange' },
        { label: 'In store, no price', value: 'inStore' },
      ],
      admin: {
        description:
          'From price: shows "from X kr.". Price range: shows "X to Y kr.". Both send the customer to the quote form. In store: shows a text instead of a price.',
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
    // Fra-pris og prisinterval
    {
      name: 'fromPrice',
      type: 'number',
      label: 'From price (kr.)',
      min: 0,
      admin: { condition: (data: Data) => data?.pricingModel === 'fromPrice' || data?.pricingModel === 'priceRange' },
    },
    {
      name: 'toPrice',
      type: 'number',
      label: 'To price (kr.)',
      min: 0,
      admin: { condition: isModel('priceRange') },
    },
    // I butikken
    {
      name: 'storeText',
      type: 'textarea',
      label: 'Text instead of a price',
      admin: {
        condition: isModel('inStore'),
        description: 'Shown in the price box when the service is chosen.',
      },
    },
    {
      name: 'options',
      type: 'array',
      label: 'Add-ons',
      labels: { singular: 'Add-on', plural: 'Add-ons' },
      admin: {
        condition: isModel('perUnit'),
        description: 'Choices the customer can tick.',
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
              admin: { width: '20%', description: 'Only shown from this quantity. Empty: always.' },
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
      admin: { position: 'sidebar', description: 'Turn off to hide the service.' },
    },
  ],
}
