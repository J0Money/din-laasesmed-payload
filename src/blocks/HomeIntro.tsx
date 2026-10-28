import Image from 'next/image'
import Link from 'next/link'
import type { Block } from 'payload'

import { CertificateIcon, ClockIcon, HandshakeIcon, LockShieldIcon, StoreIcon } from '@/components/home/HomeIcons'
import { HOME_BUTTON, SectionHeadline } from '@/components/home/SectionHeadline'
import { linkField } from '@/fields/link'
import { resolveLinkHref } from '@/lib/link'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { HomeIntroBlock as HomeIntroBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

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
  labels: { singular: 'Home page intro', plural: 'Home page intros' },
  fields: contentWithSpacingTabs('homeIntro', [
    { name: 'tagline', type: 'text', required: true, label: 'Tagline', defaultValue: 'Din lokale låsesmed siden 1992' },
    { name: 'heading', type: 'text', required: true, label: 'Heading', defaultValue: 'Den rette løsning' },
    {
      name: 'features',
      type: 'array',
      label: 'Benefits',
      maxRows: 6,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          defaultValue: 'lock',
          options: [
            { label: 'Lock with shield', value: 'lock' },
            { label: 'Headset (24/7 service)', value: 'clock' },
            { label: 'Certificate', value: 'certificate' },
            { label: 'Handshake', value: 'handshake' },
          ],
        },
        { name: 'title', type: 'text', required: true, label: 'Bold text' },
        { name: 'text', type: 'text', required: true, label: 'Text after the bold text' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      admin: { description: 'Shown as a square. Use the original file, not a cropped version.' },
    },
    linkField,
  ]),
}

export function HomeIntro({ features, heading, image, link, tagline }: HomeIntroBlockProps) {
  const imageUrl = mediaUrl(image)

  return (
    <section className="py-(--fluid-section)">
      {/* Fra 992px er billedet en tredjedel af containeren, teksten fylder resten og centreres lodret; under 992px stables de. */}
      <div className="site-container flex flex-col gap-(--fluid-gap-lg) min-[992px]:grid min-[992px]:grid-cols-[1fr_calc((100%-2*var(--fluid-gap))/3)] min-[992px]:gap-(--fluid-gap)">
        <div className="flex flex-col justify-center gap-(--fluid-gap-md)">
          <SectionHeadline tagline={tagline} title={heading} leading="leading-[1.5]" />

          <div className="grid max-w-[768px] grid-cols-1 gap-(--fluid-gap) min-[480px]:grid-cols-2 min-[992px]:gap-6">
            {(features ?? []).map((feature) => {
              const Icon = ICONS[feature.icon ?? 'lock']
              return (
                <div key={feature.id} data-animate="fade-up" className="flex gap-5">
                  <span className="flex size-(--fluid-icon) shrink-0 items-center justify-center rounded-lg bg-brand-500 text-[#edf0f3]">
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
            <Image
              src={imageUrl}
              alt={mediaAlt(image)}
              fill
              sizes="(min-width: 992px) 33vw, 100vw"
              className="object-cover"
            />
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
