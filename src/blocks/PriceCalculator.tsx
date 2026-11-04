import type { Block } from 'payload'

import { PriceCalculatorClient } from '@/components/priceCalculator/PriceCalculatorClient'
import { getCms } from '@/lib/cms'
import type { PriceCalculatorBlock as PriceCalculatorBlockProps, PriceService } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/**
 * Prisberegner (ny, findes ikke på originalen): kunden vælger ydelser, tidspunkt og postnummer og får en vejledende pris.
 * Priser og regler står i globalen "Price calculator" og samlingen "Price calculator services". Valgene sendes med i tilbudsformularen.
 */
export const priceCalculatorBlock: Block = {
  slug: 'priceCalculator',
  interfaceName: 'PriceCalculatorBlock',
  labels: { singular: 'Price calculator', plural: 'Price calculators' },
  fields: contentWithSpacingTabs('priceCalculator', [
    { name: 'heading', type: 'text', required: true, label: 'Heading (H1)', defaultValue: 'Beregn din pris' },
    { name: 'intro', type: 'textarea', label: 'Intro text' },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      label: 'Categories',
      defaultValue: ['emergency', 'mechanical', 'electronic'],
      options: [
        { label: 'Emergency', value: 'emergency' },
        { label: 'Mechanical security', value: 'mechanical' },
        { label: 'Electronic security', value: 'electronic' },
      ],
      admin: { description: 'Which services the calculator shows.' },
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Quote form',
      admin: { description: 'The customer\'s choices and price are sent with the form. Empty uses the form from Site Settings.' },
    },
  ]),
}

export async function PriceCalculator({ categories, form, heading, intro }: PriceCalculatorBlockProps) {
  const payload = await getCms()
  const [settings, services, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'priceCalculator', depth: 0 }),
    payload.find({
      collection: 'priceServices',
      where: { enabled: { equals: true } },
      sort: '_order',
      depth: 0,
      limit: 200,
      pagination: false,
    }),
    payload.findGlobal({ slug: 'siteSettings', depth: 0 }),
  ])

  let formId: null | string | undefined = typeof form === 'string' ? form : form?.id
  if (!formId) formId = typeof siteSettings.ctaForm === 'string' ? siteSettings.ctaForm : siteSettings.ctaForm?.id
  const formDoc = formId ? await payload.findByID({ collection: 'forms', id: formId, depth: 1 }).catch(() => null) : null

  const shown: PriceService['category'][] = categories?.length ? categories : ['emergency', 'mechanical', 'electronic']

  return (
    <section className="bg-background py-(--fluid-section)">
      <div className="site-container">
        <h1 className="text-trim font-heading text-(length:--fluid-h1) leading-[1.3] font-light tracking-[-0.03em] text-ink-800">
          {heading}
        </h1>
        {intro && <p className="mt-6 max-w-[640px] text-base leading-6 text-text-body">{intro}</p>}
        <PriceCalculatorClient
          categories={shown}
          form={formDoc}
          phone={siteSettings.phone ?? null}
          services={services.docs.filter((service) => shown.includes(service.category))}
          settings={settings}
        />
      </div>
    </section>
  )
}
