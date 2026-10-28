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
  labels: { singular: 'Forside-hero', plural: 'Forside-hero' },
  fields: [
    { name: 'videoWebm', type: 'upload', relationTo: 'videos', label: 'Video (WebM)' },
    { name: 'videoMp4', type: 'upload', relationTo: 'videos', label: 'Video (MP4)' },
    {
      name: 'textBox',
      type: 'number',
      label: 'Mørk boks bag teksten (%)',
      defaultValue: 40,
      min: 0,
      max: 90,
      admin: {
        description: 'En mørk, gennemsigtig boks mellem videoen og teksten, så teksten er lettere at læse. Resten af videoen røres ikke. 0 fjerner boksen.',
      },
    },
    { name: 'leftText', type: 'text', required: true, label: 'Tekst til venstre', defaultValue: 'Din Låsesmed' },
    { name: 'rightText', type: 'text', required: true, label: 'Tekst til højre', defaultValue: 'Din tryghed' },
    {
      name: 'buttons',
      type: 'array',
      label: 'Knapper',
      maxRows: 2,
      fields: [
        linkField,
        {
          name: 'accent',
          type: 'checkbox',
          label: 'Rød knap med flueben',
          defaultValue: false,
          admin: { description: 'Ellers en blå knap.' },
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
        {/* Boksen ligger mellem video og tekst og følger tekstens størrelse. */}
        <div
          className="flex flex-col items-center gap-6 rounded-2xl px-[clamp(20px,4vw,56px)] py-[clamp(12px,2vw,32px)]"
          style={{ backgroundColor: `rgba(18, 23, 41, ${(textBox ?? 40) / 100})` }}
        >
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
