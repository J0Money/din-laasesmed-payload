import Link from 'next/link'
import type { Block } from 'payload'

import { CertificateIcon, ClockIcon, HandshakeIcon, LockShieldIcon, StoreIcon } from '@/components/home/HomeIcons'
import { HOME_BUTTON, SectionHeadline } from '@/components/home/SectionHeadline'
import { linkField } from '@/fields/link'
import { resolveLinkHref } from '@/lib/link'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { HomeIntroBlock as HomeIntroBlockProps } from '@/payload-types'

const ICONS = {
  lock: LockShieldIcon,
  clock: ClockIcon,
  certificate: CertificateIcon,
  handshake: HandshakeIcon,
} as const

/** "Den rette løsning" (Webflow: Section / Intro home): fire fordele til venstre, et stort billede med en knap til højre. */
export const homeIntroBlock: Block = {
  slug: 'homeIntro',
  interfaceName: 'HomeIntroBlock',
  labels: { singular: 'Forside-intro', plural: 'Forside-intro' },
  fields: [
    { name: 'tagline', type: 'text', required: true, label: 'Tagline', defaultValue: 'Din lokale låsesmed siden 1992' },
    { name: 'heading', type: 'text', required: true, label: 'Overskrift', defaultValue: 'Den rette løsning' },
    {
      name: 'features',
      type: 'array',
      label: 'Fordele',
      maxRows: 6,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Ikon',
          defaultValue: 'lock',
          options: [
            { label: 'Lås med skjold', value: 'lock' },
            { label: 'Headset (døgnvagt)', value: 'clock' },
            { label: 'Certifikat', value: 'certificate' },
            { label: 'Håndtryk', value: 'handshake' },
          ],
        },
        { name: 'title', type: 'text', required: true, label: 'Fed tekst' },
        { name: 'text', type: 'text', required: true, label: 'Tekst efter den fede' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Billede',
      admin: { description: 'Vises i kvadrat. Brug originalfilen, ikke en beskåret udgave.' },
    },
    linkField,
  ],
}

export function HomeIntro({ features, heading, image, link, tagline }: HomeIntroBlockProps) {
  const imageUrl = mediaUrl(image)

  return (
    <section className="py-20">
      {/* Billedet er en tredjedel af containeren (426.67px), teksten fylder resten og centreres lodret. */}
      <div className="site-container grid grid-cols-1 gap-8 lg:grid-cols-[1fr_calc((100%-64px)/3)]">
        <div className="flex flex-col justify-center gap-12">
          <SectionHeadline tagline={tagline} title={heading} leading="leading-[60px]" />

          <div className="grid max-w-[768px] grid-cols-1 gap-6 sm:grid-cols-2">
            {(features ?? []).map((feature) => {
              const Icon = ICONS[feature.icon ?? 'lock']
              return (
                <div key={feature.id} className="flex gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-[#edf0f3]">
                    <Icon className="h-[19px] w-4" />
                  </span>
                  <p className="text-text-body">
                    <strong className="font-bold">{feature.title}</strong> {feature.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {imageUrl && (
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={mediaAlt(image)} className="absolute inset-0 h-full w-full object-cover" />
            {link?.label && (
              <div className="absolute inset-x-8 bottom-6">
                <Link href={resolveLinkHref(link)} className={`button-accent w-full ${HOME_BUTTON} py-[18.4px]`}>
                  <span className="text-trim">{link.label}</span>
                  <StoreIcon className="h-auto w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
