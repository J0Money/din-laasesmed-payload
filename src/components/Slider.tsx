'use client'

import { Children, useEffect, useRef, useState } from 'react'

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

/**
 * Som originalens Swiper-slidere ("Alle mærker", "Vores historie"): overskrift med pile øverst til højre,
 * ét kort pr. klik (kortets bredde + mellemrum), 300 ms, stopper ved sidste kort.
 * Børnene er slidernes <li>-elementer.
 */
export function Slider({ title, gap, children }: { title: string; gap: number; children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const [offset, setOffset] = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)
  const [step, setStep] = useState(0)
  const count = Children.count(children)

  useEffect(() => {
    function measure() {
      const track = trackRef.current
      const overflow = (track?.scrollWidth ?? 0) - (viewportRef.current?.clientWidth ?? 0)
      setMaxOffset(Math.max(overflow, 0))
      setStep(((track?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0) + gap)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [count, gap])

  const clamped = Math.min(offset, maxOffset)
  const move = (direction: 1 | -1) => setOffset(Math.min(Math.max(clamped + direction * step, 0), maxOffset))

  return (
    <>
      <div className="flex items-start justify-between gap-12 pb-8">
        <h2 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.5] font-light text-ink-800">{title}</h2>
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
          className="flex transition-transform duration-300 ease-out"
          style={{ gap, transform: `translate3d(${-clamped}px, 0, 0)` }}
        >
          {children}
        </ul>
      </div>
    </>
  )
}
