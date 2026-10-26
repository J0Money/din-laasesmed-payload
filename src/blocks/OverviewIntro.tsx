import type { Block } from 'payload'

import { RichText } from '@/components/RichText'
import type { OverviewIntroBlock as OverviewIntroBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/**
 * Grå intro-bånd (Webflow: Section / Overview / Intro): tagline og navn til venstre, overskrift og tekst til højre.
 * Bruges på mærkeoversigten og Ledige stillinger; kategorisiderne har det som skabelon i koden.
 * Rykkes 32px ned under det næste bånd (kortgitteret), derfor 112px i bunden.
 */
export const overviewIntroBlock: Block = {
  slug: 'overviewIntro',
  interfaceName: 'OverviewIntroBlock',
  labels: { singular: 'Intro-bånd', plural: 'Intro-bånd' },
  fields: contentWithSpacingTabs('overviewIntro', [
    {
      name: 'tagline',
      type: 'text',
      required: true,
      label: 'Tagline',
      admin: { description: 'Lille blå tekst øverst til venstre, fx "Vi forhandler".' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Navn (H1)',
      admin: { description: 'Stor tekst til venstre, fx "Se alle mærker".' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Overskrift til højre',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Tekst',
    },
  ]),
}

export function OverviewIntro({ content, heading, tagline, title }: OverviewIntroBlockProps) {
  return (
    <section className="relative overflow-x-clip bg-surface-muted pt-(--fluid-section) pb-(--fluid-pad)">
      <div className="site-container relative z-10 flex flex-col gap-12 min-[992px]:flex-row min-[992px]:justify-between">
        <div className="flex shrink-0 flex-col gap-2">
          <p className="text-sm leading-[21px] font-medium text-brand-500">{tagline}</p>
          <h1 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.5] font-light text-ink-900">
            {title}
          </h1>
        </div>

        <div className="relative left-5 flex w-full max-w-[768px] flex-col gap-8">
          <h2 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-h2) leading-[1.3] font-light text-ink-800">
            {heading}
          </h2>
          {content && <RichText data={content} className="[&>:last-child]:mb-0" />}
        </div>
      </div>
    </section>
  )
}
