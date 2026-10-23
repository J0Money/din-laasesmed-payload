'use client'

import { useEffect, useState } from 'react'

import { QuoteIcon } from './HomeIcons'

type Testimonial = { quote: string; author: string; id?: string | null }

// Samme opførsel som originalens Webflow-slider: autoplay 5 s, "out-in"-fade på 500 ms, uendelig løkke.
const DELAY_MS = 5000
const FADE_MS = 250

export function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (testimonials.length < 2) return
    const timer = setTimeout(() => setActive((i) => (i + 1) % testimonials.length), DELAY_MS)
    return () => clearTimeout(timer)
  }, [active, testimonials.length])

  return (
    <div className="relative w-full max-w-[800px]">
      {/* Alle slides ligger i samme grid-celle, så højden altid er den højeste slides. */}
      <div className="grid">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id ?? index}
            aria-hidden={index !== active}
            className="col-start-1 row-start-1 flex items-start gap-24 transition-opacity ease-in-out"
            style={{
              opacity: index === active ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
              transitionDelay: index === active ? `${FADE_MS}ms` : '0ms',
            }}
          >
            <div className="flex max-w-[648px] flex-1 flex-col gap-6">
              <p className="text-trim font-heading text-2xl leading-8 text-ink-800">{testimonial.quote}</p>
              <p className="self-start font-heading text-sm leading-[21px] font-medium text-[#69748c] italic">
                {testimonial.author}
              </p>
            </div>
            <QuoteIcon className="h-[39px] w-14 shrink-0 text-brand-500" />
          </div>
        ))}
      </div>

      {testimonials.length > 1 && (
        <div className="absolute top-[72px] right-0 flex">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id ?? index}
              type="button"
              aria-label={`Vis udtalelse ${index + 1}`}
              onClick={() => setActive(index)}
              className="mx-[3px] mb-[5px] h-[0.8rem] rounded-2xl transition-[width] duration-200 ease-in-out"
              style={{
                width: index === active ? '3rem' : '0.8rem',
                backgroundColor: index === active ? 'var(--color-brand-500)' : 'var(--color-ink-muted)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
