import type { Block } from 'payload'

import { SectionHeadline } from '@/components/home/SectionHeadline'
import { TestimonialSlider } from '@/components/home/TestimonialSlider'
import type { HomeTestimonialsBlock as HomeTestimonialsBlockProps } from '@/payload-types'

/** Kundeudtalelser (Webflow: Section / Testimonials): skifter automatisk hvert 5. sekund. */
export const homeTestimonialsBlock: Block = {
  slug: 'homeTestimonials',
  interfaceName: 'HomeTestimonialsBlock',
  labels: { singular: 'Kundeudtalelser', plural: 'Kundeudtalelser' },
  fields: [
    { name: 'tagline', type: 'text', required: true, label: 'Tagline', defaultValue: 'Hvad siger vores kunder' },
    { name: 'heading', type: 'text', required: true, label: 'Overskrift', defaultValue: 'Udtalelser' },
    {
      name: 'items',
      type: 'array',
      label: 'Udtalelser',
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: 'Citat' },
        { name: 'author', type: 'text', required: true, label: 'Kunde' },
      ],
    },
  ],
}

export function HomeTestimonials({ heading, items, tagline }: HomeTestimonialsBlockProps) {
  if (!items?.length) return null

  return (
    <section className="bg-surface-muted py-20">
      <div className="mx-auto flex w-full max-w-[1117px] flex-col items-start justify-center gap-10 px-4 lg:flex-row lg:gap-16 lg:px-0">
        <div className="shrink-0">
          <SectionHeadline tagline={tagline} title={heading} />
        </div>
        <TestimonialSlider testimonials={items} />
      </div>
    </section>
  )
}
