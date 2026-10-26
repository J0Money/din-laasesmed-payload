import { Fragment } from 'react'
import type { Block } from 'payload'

import { ParallaxImage } from '@/components/home/ParallaxImage'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ParallaxBandBlock as ParallaxBandBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/** Motto-bånd med parallax-billede (Webflow: Section / Parallax element), fx "Din Låsesmed • Din tryghed". */
export const parallaxBandBlock: Block = {
  slug: 'parallaxBand',
  interfaceName: 'ParallaxBandBlock',
  labels: { singular: 'Parallax-bånd', plural: 'Parallax-bånd' },
  fields: contentWithSpacingTabs('parallaxBand', [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Baggrundsbillede',
    },
    {
      name: 'leftText',
      type: 'text',
      required: true,
      label: 'Tekst til venstre',
    },
    {
      name: 'rightText',
      type: 'text',
      required: true,
      label: 'Tekst til højre',
    },
  ]),
}

/*
 * Originalens størrelser her er flydende mellem 320 og 1440px viewport (maks. fra 1440px og op):
 * tekst 36→48px (28→32px under 480px), mellemrum 28→32px og padding 64→112px.
 */
export function ParallaxBand({ image, leftText, rightText }: ParallaxBandBlockProps) {
  return (
    <section className="relative flex items-center justify-center overflow-hidden py-[clamp(64px,calc(64px+48*(100vw-320px)/1120),112px)]">
      <ParallaxImage src={mediaUrl(image) ?? ''} alt={mediaAlt(image)} />
      <div aria-hidden className="absolute inset-0 z-[2] bg-ink-900 opacity-80" />
      <div className="site-container relative z-[3] flex items-center justify-center gap-[clamp(28px,calc(28px+4*(100vw-320px)/1120),32px)]">
        {[leftText, rightText].map((text, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <span aria-hidden className="mt-[15px] hidden h-3 w-3 shrink-0 rounded-full bg-[#edf0f3] md:block" />
            )}
            <p className="text-trim mt-5 mb-[10px] font-heading text-[clamp(28px,calc(28px+4*(100vw-320px)/1120),32px)] leading-none font-light text-[#edf0f3] min-[480px]:whitespace-nowrap min-[480px]:text-[clamp(36px,calc(36px+12*(100vw-320px)/1120),48px)]">
              {text}
            </p>
          </Fragment>
        ))}
      </div>
    </section>
  )
}
