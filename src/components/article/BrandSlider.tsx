import Link from 'next/link'

import { Slider } from '@/components/Slider'

type BrandSlide = { id: string; href: string; name: string; logoUrl?: string; logoAlt?: string }

/*
 * Som originalens Swiper: 3:2-kort, ét kort pr. klik. Antal kort og mellemrum følger vinduets bredde
 * som originalens breakpoints: 1,2 kort / 6px, fra 644px 2 / 12px, fra 996px 3 / 24px og fra 1285px 4 / 32px.
 */
export function BrandSlider({ title, slides }: { title: string; slides: BrandSlide[] }) {
  return (
    <Slider title={title} trackClassName="gap-1.5 min-[644px]:gap-3 min-[996px]:gap-6 min-[1285px]:gap-8">
      {slides.map((slide) => (
        <li
          key={slide.id}
          className="relative flex aspect-[3/2] w-[calc((100%-1.2px)/1.2)] shrink-0 items-center justify-center rounded-2xl border border-[#ced5e1] bg-surface-form px-12 py-8 shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-[border-color,box-shadow] duration-200 hover:border-brand-500 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] min-[644px]:w-[calc((100%-12px)/2)] min-[996px]:w-[calc((100%-48px)/3)] min-[1285px]:w-[calc((100%-96px)/4)]"
        >
          {slide.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.logoUrl} alt={slide.logoAlt || slide.name} className="aspect-[2/1] w-full max-w-[200px] object-contain" />
          ) : (
            <span className="font-heading text-xl text-ink-800">{slide.name}</span>
          )}
          <Link href={slide.href} className="absolute inset-0" aria-label={slide.name} />
        </li>
      ))}
    </Slider>
  )
}
