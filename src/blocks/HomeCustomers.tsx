import Image from 'next/image'
import type { Block } from 'payload'

import { PinIcon } from '@/components/home/HomeIcons'
import { SectionHeadline } from '@/components/home/SectionHeadline'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { HomeCustomersBlock as HomeCustomersBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/** Erhvervskunder (Webflow: Section / Masonry): logoer på farvede flader og fotos med stedsnavn i tre kolonner. */
export const homeCustomersBlock: Block = {
  slug: 'homeCustomers',
  interfaceName: 'HomeCustomersBlock',
  labels: { singular: 'Business customers', plural: 'Business customers' },
  fields: contentWithSpacingTabs('homeCustomers', [
    { name: 'tagline', type: 'text', required: true, label: 'Tagline', defaultValue: 'Fra havedøren til havudsigt' },
    { name: 'heading', type: 'text', required: true, label: 'Heading', defaultValue: 'Mød vores erhvervskunder' },
    {
      name: 'items',
      type: 'array',
      label: 'Customers',
      labels: { singular: 'Business customer', plural: 'Business customers' },
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Image/logo' },
        { name: 'label', type: 'text', label: 'Place name (optional, shown as a badge on photos)' },
        {
          name: 'type',
          type: 'radio',
          label: 'Type',
          defaultValue: 'logo',
          options: [
            { label: 'Logo', value: 'logo' },
            { label: 'Photo', value: 'photo' },
          ],
        },
        {
          name: 'bgColor',
          type: 'text',
          label: 'Background color (logo type only, hex)',
          defaultValue: '#ffffff',
          admin: { condition: (_, siblingData) => siblingData?.type === 'logo' },
        },
        {
          name: 'logoHeight',
          type: 'number',
          label: 'Logo height in px (logo type only)',
          defaultValue: 96,
          admin: { condition: (_, siblingData) => siblingData?.type === 'logo' },
        },
      ],
    },
  ]),
}

export function HomeCustomers({ heading, items, tagline }: HomeCustomersBlockProps) {
  if (!items?.length) return null

  return (
    <section className="bg-surface-muted py-(--fluid-section)">
      <div className="site-container flex flex-col gap-12">
        <div data-animate="fade-up">
          <SectionHeadline tagline={tagline} title={heading} center />
        </div>

        <div className="columns-1 gap-8 min-[768px]:columns-2 min-[992px]:columns-3">
          {items.map((customer) => {
            const url = mediaUrl(customer.image)
            if (!url) return null

            return (
              <div key={customer.id} data-animate="fade-up" className="mb-8 break-inside-avoid overflow-hidden rounded-2xl">
                {customer.type === 'logo' ? (
                  <div
                    className="flex aspect-[2/1] items-center justify-center"
                    style={{ backgroundColor: customer.bgColor || '#ffffff' }}
                  >
                    <Image
                      src={url}
                      alt={mediaAlt(customer.image)}
                      width={400}
                      height={200}
                      sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="aspect-auto w-full object-contain"
                      style={{ height: customer.logoHeight ?? 96 }}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-square">
                    <Image
                      src={url}
                      alt={mediaAlt(customer.image)}
                      fill
                      sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                    {customer.label && (
                      <span className="absolute bottom-8 left-8 flex items-center gap-[9.6px] rounded-lg bg-[rgba(34,41,59,0.25)] px-4 py-3 text-[#edf0f3] backdrop-blur-[5px]">
                        <PinIcon />
                        <span className="font-heading text-xs leading-[18px]">{customer.label}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
