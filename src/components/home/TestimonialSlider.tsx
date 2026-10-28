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
    <div data-animate="fade-up" className="relative w-[800px] shrink-0 max-[991px]:pb-(--fluid-gap-lg)">
      {/* Alle slides ligger i samme grid-celle, så højden altid er den højeste slides. */}
      <div className="grid">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id ?? index}
            aria-hidden={index !== active}
            className="col-start-1 row-start-1 flex items-start gap-(--fluid-slide-gap) transition-opacity ease-in-out"
            style={{
              opacity: index === active ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
              transitionDelay: index === active ? `${FADE_MS}ms` : '0ms',
            }}
          >
            <div className="flex w-[min(648px,100cqw)] shrink-0 flex-col gap-6">
              <p className="text-trim font-heading text-[22px] leading-[30px] text-ink-800 min-[480px]:text-2xl min-[480px]:leading-8">{testimonial.quote}</p>
              <p className="self-start font-heading text-sm leading-[21px] font-medium text-[#69748c] italic">
                {testimonial.author}
              </p>
            </div>
            <QuoteIcon className="h-[39px] w-14 shrink-0 text-brand-500" />
          </div>
        ))}
      </div>

      {testimonials.length > 1 && (
        <div className="absolute bottom-0 left-0 flex min-[768px]:left-1/2 min-[768px]:-translate-x-1/2 min-[992px]:top-[72px] min-[992px]:right-0 min-[992px]:bottom-auto min-[992px]:left-auto min-[992px]:translate-x-0">
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
