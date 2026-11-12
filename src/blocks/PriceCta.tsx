import Image from 'next/image'
import Link from 'next/link'
import type { Block } from 'payload'

import { BlockWrapper } from '@/components/blocks/BlockWrapper'
import { HOME_BUTTON } from '@/components/home/SectionHeadline'
import { CalculatorIcon } from '@/components/layout/NavIcons'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ROUTES } from '@/lib/routes'
import type { PriceCtaBlock as PriceCtaBlockProps } from '@/payload-types'

import { layoutTab } from './fields/layout'

/** Kort med en "Beregn pris"-knap til prisberegneren, til forsiden, oversigtssider og lokale sider. Ydelsen kan vælges på forhånd. */
export const priceCtaBlock: Block = {
  slug: 'priceCta',
  interfaceName: 'PriceCtaBlock',
  labels: { singular: 'Price calculator button', plural: 'Price calculator buttons' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', required: true, label: 'Heading', defaultValue: 'Hvad koster det?' },
            { name: 'text', type: 'textarea', label: 'Text', defaultValue: 'Få en vejledende pris med det samme.' },
            { name: 'buttonLabel', type: 'text', required: true, label: 'Button text', defaultValue: 'Beregn pris' },
            {
              name: 'contactLabel',
              type: 'text',
              label: 'Contact button text',
              defaultValue: 'Kontakt os',
              admin: { description: 'A second button to the contact page. Empty: no second button.' },
            },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Image', admin: { description: 'Shown to the right of the text. Empty: text only.' } },
            {
              name: 'priceService',
              type: 'relationship',
              relationTo: 'priceServices',
              label: 'Price calculator service',
              admin: { description: 'The calculator opens with this service already chosen. Empty: the calculator opens without a choice.' },
            },
          ],
        },
        layoutTab('priceCta'),
      ],
    },
  ],
}

export function PriceCta({ blockClass, buttonLabel, contactLabel, heading, image, mutedBackground, priceService, text }: PriceCtaBlockProps) {
  const serviceId = typeof priceService === 'object' ? priceService?.id : (priceService ?? undefined)
  const imageUrl = mediaUrl(image)

  return (
    <BlockWrapper mutedBackground={mutedBackground} blockClass={blockClass}>
      <div className="site-container">
        <div className={`grid items-center gap-8 rounded-2xl border border-[#e4e8ef] bg-white p-(--fluid-form-pad) shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${imageUrl ? 'min-[768px]:grid-cols-2 min-[768px]:gap-12' : ''}`}>
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ced5e1] text-text-body" aria-hidden>
              <CalculatorIcon className="h-auto w-[1.35rem]" />
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-trim font-heading text-(length:--fluid-h2) leading-[1.1] font-light text-ink-800">{heading}</h2>
              {text && <p className="max-w-[520px] text-base leading-6 text-text-body">{text}</p>}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={ROUTES.priceCalculator(serviceId)} className={`button-accent ${HOME_BUTTON}`}>
                <span className="text-trim">{buttonLabel}</span>
              </Link>
              {contactLabel && (
                <Link href={ROUTES.contact()} className={`button-outline ${HOME_BUTTON}`}>
                  <span className="text-trim">{contactLabel}</span>
                </Link>
              )}
            </div>
          </div>

          {imageUrl && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={imageUrl} alt={mediaAlt(image)} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </BlockWrapper>
  )
}
