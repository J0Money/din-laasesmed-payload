import Link from 'next/link'
import type { Block } from 'payload'

import { ButtonCheckIcon } from '@/components/home/HomeIcons'
import { HOME_BUTTON } from '@/components/home/SectionHeadline'
import { LockIcon, SignalIcon } from '@/components/layout/NavIcons'
import { linkField } from '@/fields/link'
import { resolveLinkHref } from '@/lib/link'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { HomeFocusCardsBlock as HomeFocusCardsBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/**
 * Fokuskort (Webflow: Section / Quick links): tre 480px kort side om side. Billedkort har et badge med ikon og navn
 * øverst; servicekortet er mørkt med overskrift, tekst, knap og et billede nederst.
 */
export const homeFocusCardsBlock: Block = {
  slug: 'homeFocusCards',
  interfaceName: 'HomeFocusCardsBlock',
  labels: { singular: 'Fokuskort', plural: 'Fokuskort' },
  fields: contentWithSpacingTabs('homeFocusCards', [
    {
      name: 'cards',
      type: 'array',
      label: 'Kort',
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'type',
          type: 'radio',
          label: 'Type',
          defaultValue: 'image',
          options: [
            { label: 'Billedkort', value: 'image' },
            { label: 'Servicekort (mørkt)', value: 'service' },
          ],
          admin: { layout: 'horizontal' },
        },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Billede' },
        linkField,
        {
          name: 'icon',
          type: 'select',
          label: 'Ikon i badget',
          defaultValue: 'lock',
          options: [
            { label: 'Lås (mekanisk)', value: 'lock' },
            { label: 'Signal (elektronisk)', value: 'signal' },
          ],
          admin: { condition: (_, siblingData) => siblingData?.type !== 'service' },
        },
        {
          name: 'heading',
          type: 'text',
          label: 'Overskrift',
          admin: { condition: (_, siblingData) => siblingData?.type === 'service' },
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Tekst',
          admin: { condition: (_, siblingData) => siblingData?.type === 'service' },
        },
      ],
    },
  ]),
}

export function HomeFocusCards({ cards }: HomeFocusCardsBlockProps) {
  return (
    <section className="py-(--fluid-section)">
      {/* Kortene er 8:9 i tre kolonner (fra 992px) og 2:1 når de stables. */}
      <div className="site-container grid grid-cols-1 gap-(--fluid-gap) min-[992px]:grid-cols-3">
        {(cards ?? []).map((card) => {
          const href = resolveLinkHref(card.link)
          const imageUrl = mediaUrl(card.image)

          if (card.type === 'service') {
            return (
              <Link
                key={card.id}
                href={href}
                className="group flex flex-col items-start justify-between rounded-2xl bg-ink-900 text-[#ced5e1] min-[992px]:aspect-[8/9] min-[992px]:gap-10 min-[992px]:pt-16"
              >
                <div className="flex w-full shrink-0 flex-col gap-(--fluid-gap) px-(--fluid-card-pad)">
                  <h3 className="text-trim mt-5 mb-[10px] text-center font-heading text-2xl leading-[26.4px] font-normal text-[#edf0f3]">
                    {card.heading}
                  </h3>
                  <p className="text-center text-sm leading-[21px]">{card.text}</p>
                  <div className="flex justify-center">
                    <span
                      className={`button-accent ${HOME_BUTTON} group-hover:border-background group-hover:bg-background group-hover:text-ink-800`}
                    >
                      <span className="text-trim">{card.link?.label}</span>
                      <ButtonCheckIcon className="h-auto w-4" />
                    </span>
                  </div>
                </div>
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-(--fluid-dark-img) w-full rounded-b-2xl object-cover min-[992px]:h-auto min-[992px]:min-h-0 min-[992px]:flex-1" />
                )}
              </Link>
            )
          }

          const Icon = card.icon === 'signal' ? SignalIcon : LockIcon
          return (
            <Link key={card.id} href={href} className="group relative block aspect-[2/1] overflow-hidden rounded-2xl px-10 pt-10 min-[992px]:aspect-[8/9]">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={mediaAlt(card.image) || card.link?.label || ''} className="absolute inset-0 h-full w-full object-cover" />
              )}
              <span className="absolute inset-0 z-[1] bg-[rgba(34,41,59,0.25)]" />
              <span className="relative z-10 inline-flex items-center gap-3 rounded-lg bg-background px-6 py-[13.6px] max-[767px]:pl-4 text-brand-500 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-colors duration-200 group-hover:bg-ink-900 group-hover:text-white">
                <Icon className="h-5 w-5" />
                <span className="text-trim font-heading text-sm leading-[15.4px]">{card.link?.label}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
