import type { Block } from 'payload'

import { SectionHeadline } from '@/components/home/SectionHeadline'
import { TestimonialSlider } from '@/components/home/TestimonialSlider'
import type { HomeTestimonialsBlock as HomeTestimonialsBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/** Kundeudtalelser (Webflow: Section / Testimonials): skifter automatisk hvert 5. sekund. */
export const homeTestimonialsBlock: Block = {
  slug: 'homeTestimonials',
  interfaceName: 'HomeTestimonialsBlock',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: contentWithSpacingTabs('homeTestimonials', [
    { name: 'tagline', type: 'text', required: true, label: 'Tagline', defaultValue: 'Hvad siger vores kunder' },
    { name: 'heading', type: 'text', required: true, label: 'Heading', defaultValue: 'Udtalelser' },
    {
      name: 'items',
      type: 'array',
      label: 'Testimonials',
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: 'Quote' },
        { name: 'author', type: 'text', required: true, label: 'Customer' },
      ],
    },
  ]),
}

export function HomeTestimonials({ heading, items, tagline }: HomeTestimonialsBlockProps) {
  if (!items?.length) return null

  return (
    // Som originalen er slideren en fast 800px bred boks, der rager ud over den smalle container; overflow-x-clip skjuler resten.
    <section className="overflow-x-clip bg-surface-muted py-(--fluid-section)">
      {/* Originalen har 60px luft under 768px. Det, der er ud over Small, ligger her, så sektionens luft følger skalaen. */}
      <div className="site-container max-[767px]:py-[max(0px,calc(60px-var(--fluid-section)))]">
        <div className="@container mx-auto flex w-[calc(83.33%-2.7px)] flex-col items-start gap-(--fluid-gap-lg) min-[992px]:flex-row">
          <div className="shrink-0">
            <SectionHeadline tagline={tagline} title={heading} />
          </div>
          <TestimonialSlider testimonials={items} />
        </div>
      </div>
    </section>
  )
}
