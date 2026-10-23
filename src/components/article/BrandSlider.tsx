import Link from 'next/link'

import { Slider } from '@/components/Slider'

type BrandSlide = { id: string; href: string; name: string; logoUrl?: string; logoAlt?: string }

// Som originalens Swiper: 312px kort med 32px mellemrum, ét kort pr. klik.
export function BrandSlider({ title, slides }: { title: string; slides: BrandSlide[] }) {
  return (
    <Slider title={title} gap={32}>
      {slides.map((slide) => (
        <li
          key={slide.id}
          className="relative flex h-[208px] w-[312px] shrink-0 items-center justify-center rounded-2xl border border-[#ced5e1] bg-surface-form px-12 py-8 shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-[border-color,box-shadow] duration-200 hover:border-brand-500 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        >
          {slide.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.logoUrl} alt={slide.logoAlt || slide.name} className="h-[100px] w-[200px] object-contain" />
          ) : (
            <span className="font-heading text-xl text-ink-800">{slide.name}</span>
          )}
          <Link href={slide.href} className="absolute inset-0" aria-label={slide.name} />
        </li>
      ))}
    </Slider>
  )
}
