'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type BrandSlide = { id: string; href: string; name: string; logoUrl?: string; logoAlt?: string }

// Som originalens Swiper: ét kort (312px + 32px mellemrum) pr. klik, 300 ms, stopper ved sidste kort.
const STEP_PX = 344

function ArrowIcon({ reversed = false }: { reversed?: boolean }) {
  return (
    <svg viewBox="0 0 29.541 22.323" className={`h-full w-full ${reversed ? 'rotate-180' : ''}`} aria-hidden>
      <g transform="translate(0 1.014)">
        <path d="M115.445,20.633l9.311-10.148L115.445.338" transform="translate(-97.25 -0.338)" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="3" />
        <line x1="27.506" transform="translate(0 10.148)" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="3" />
      </g>
    </svg>
  )
}

export function BrandSlider({ title, slides }: { title: string; slides: BrandSlide[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const [offset, setOffset] = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)

  useEffect(() => {
    function measure() {
      const overflow = (trackRef.current?.scrollWidth ?? 0) - (viewportRef.current?.clientWidth ?? 0)
      setMaxOffset(Math.max(overflow, 0))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [slides.length])

  const clamped = Math.min(offset, maxOffset)
  const move = (direction: 1 | -1) => setOffset(Math.min(Math.max(clamped + direction * STEP_PX, 0), maxOffset))

  return (
    <>
      <div className="flex items-start justify-between gap-12 pb-8">
        <h2 className="text-trim mt-5 mb-[10px] font-heading text-[32px] leading-[48px] font-light text-ink-800">{title}</h2>
        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Forrige"
            disabled={clamped <= 0}
            onClick={() => move(-1)}
            className="h-6 w-[1.9rem] cursor-pointer text-ink-muted transition-colors duration-200 hover:text-ink-900"
          >
            <ArrowIcon reversed />
          </button>
          <button
            type="button"
            aria-label="Næste"
            disabled={clamped >= maxOffset}
            onClick={() => move(1)}
            className="h-6 w-[1.9rem] cursor-pointer text-ink-muted transition-colors duration-200 hover:text-ink-900"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="overflow-hidden">
        <ul
          ref={trackRef}
          className="flex gap-8 transition-transform duration-300 ease-out"
          style={{ transform: `translate3d(${-clamped}px, 0, 0)` }}
        >
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
        </ul>
      </div>
    </>
  )
}
