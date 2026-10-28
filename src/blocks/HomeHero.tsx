import Link from 'next/link'
import type { Block } from 'payload'

import { HOME_BUTTON } from '@/components/home/SectionHeadline'
import { ButtonCheckIcon } from '@/components/home/HomeIcons'
import { linkField } from '@/fields/link'
import { resolveLinkHref } from '@/lib/link'
import type { HomeHeroBlock as HomeHeroBlockProps } from '@/payload-types'

/** Forsidens videohero (Webflow: Section / Hero / Placeholder): 640px video med to tekster og op til to knapper. */
export const homeHeroBlock: Block = {
  slug: 'homeHero',
  interfaceName: 'HomeHeroBlock',
  labels: { singular: 'Home page hero', plural: 'Home page heroes' },
  fields: [
    { name: 'videoWebm', type: 'upload', relationTo: 'videos', label: 'Video (WebM)' },
    { name: 'videoMp4', type: 'upload', relationTo: 'videos', label: 'Video (MP4)' },
    {
      name: 'textBox',
      type: 'number',
      label: 'Dark tone behind the text (%)',
      defaultValue: 60,
      min: 0,
      max: 90,
      admin: {
        description: 'A soft, dark tone between the video and the text, so the text is easier to read. It fades out toward the edges and does not touch the rest of the video. 0 removes it.',
      },
    },
    { name: 'leftText', type: 'text', required: true, label: 'Left text', defaultValue: 'Din Låsesmed' },
    { name: 'rightText', type: 'text', required: true, label: 'Right text', defaultValue: 'Din tryghed' },
    {
      name: 'buttons',
      type: 'array',
      label: 'Buttons',
      maxRows: 2,
      fields: [
        linkField,
        {
          name: 'accent',
          type: 'checkbox',
          label: 'Red button with checkmark',
          defaultValue: false,
          admin: { description: 'Otherwise a blue button.' },
        },
      ],
    },
  ],
}

export function HomeHero({ buttons, leftText, rightText, textBox, videoMp4, videoWebm }: HomeHeroBlockProps) {
  const webm = typeof videoWebm === 'object' ? videoWebm?.url : undefined
  const mp4 = typeof videoMp4 === 'object' ? videoMp4?.url : undefined

  return (
    // Mål fra originalen: 640px fra 992px, ellers et billedformat der følger bredden (2:1, under 480px 3:2).
    <section className="relative aspect-[3/2] overflow-hidden bg-ink-900 min-[480px]:aspect-[2/1] min-[992px]:aspect-auto min-[992px]:h-[640px]">
      {(webm || mp4) && (
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          {webm && <source src={webm} type="video/webm" />}
          {mp4 && <source src={mp4} type="video/mp4" />}
        </video>
      )}

      <div data-animate="fade" data-delay="800" className="site-container relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center">
        {/* Blød, mørk tone mellem video og tekst: en oval, der er mørkest bag teksten og toner ud mod kanterne, uden hård kant. */}
        <div className="relative flex flex-col items-center gap-6">
          <div
            aria-hidden
            className="absolute -inset-x-[22%] -inset-y-[55%] -z-10"
            style={{
              background: `radial-gradient(ellipse closest-side, rgba(18, 23, 41, ${(textBox ?? 60) / 100}) 0%, rgba(18, 23, 41, ${((textBox ?? 60) / 100) * 0.6}) 45%, rgba(18, 23, 41, 0) 100%)`,
            }}
          />
          <h1 className="mt-5 mb-[10px] flex flex-wrap items-center justify-center gap-x-(--fluid-gap) gap-y-2 font-heading text-(length:--fluid-hero-h1) leading-none font-light text-[#edf0f3]">
            <span className="text-trim">{leftText}</span>
            <span className="hidden h-3 w-3 shrink-0 rounded-full bg-[#edf0f3] min-[768px]:block" />
            <span className="text-trim">{rightText}</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {(buttons ?? []).map((button) => (
              <Link
                key={button.id}
                href={resolveLinkHref(button.link)}
                target={button.link?.newTab ? '_blank' : undefined}
                className={`${button.accent ? 'button-accent' : 'button'} ${HOME_BUTTON}`}
              >
                <span className="text-trim">{button.link?.label}</span>
                {button.accent && <ButtonCheckIcon className="h-auto w-4" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
