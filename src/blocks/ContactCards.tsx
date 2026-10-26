import Link from 'next/link'
import type { Block } from 'payload'

import { CertificateIcon, ClockIcon, MailIcon, ShopIcon } from '@/components/home/HomeIcons'
import { linkField } from '@/fields/link'
import { resolveLinkHref } from '@/lib/link'
import type { ContactCardsBlock as ContactCardsBlockProps } from '@/payload-types'

const ICONS = {
  phone: ClockIcon,
  shop: ShopIcon,
  mail: MailIcon,
  certificate: CertificateIcon,
} as const

/** Kontaktkort (Webflow: contact_cards): fire hvide kort med ikon, tekst og en knap, der overlapper videobåndet. */
export const contactCardsBlock: Block = {
  slug: 'contactCards',
  interfaceName: 'ContactCardsBlock',
  labels: { singular: 'Kontaktkort', plural: 'Kontaktkort' },
  fields: [
    {
      name: 'cards',
      type: 'array',
      label: 'Kort',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Ikon',
          defaultValue: 'phone',
          options: [
            { label: 'Telefon (headset)', value: 'phone' },
            { label: 'Butik', value: 'shop' },
            { label: 'Mail', value: 'mail' },
            { label: 'Certifikat', value: 'certificate' },
          ],
        },
        {
          name: 'text',
          type: 'text',
          required: true,
          label: 'Tekst',
        },
        linkField,
        {
          name: 'filled',
          type: 'checkbox',
          label: 'Udfyldt knap',
          defaultValue: false,
          admin: { description: 'Blå knap i stedet for en knap med kant.' },
        },
      ],
    },
  ],
}

export function ContactCards({ cards }: ContactCardsBlockProps) {
  return (
    <div className="relative z-10 -mt-8">
      <ul className="site-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(cards ?? []).map((card) => {
          const Icon = ICONS[card.icon ?? 'phone']
          const newTab = card.link?.newTab
          return (
            <li
              key={card.id}
              className="flex flex-col justify-between gap-5 rounded-2xl border border-[#e4e8ef] bg-white px-7 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-[#edf0f3]">
                  <Icon className="h-auto w-4" />
                </span>
                <p className="font-heading leading-5 font-medium text-ink-800">{card.text}</p>
              </div>
              <Link
                href={resolveLinkHref(card.link)}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                className={`flex items-center justify-center gap-4 rounded-lg border px-4 py-[12.8px] font-heading text-xl leading-[30px] transition-colors duration-200 ${
                  card.filled
                    ? 'border-white bg-brand-500 text-white hover:bg-[#52a24d]'
                    : 'border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-[#edf0f3]'
                }`}
              >
                <Icon className="h-auto w-[18px]" />
                <span className="text-base leading-6">{card.link?.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
