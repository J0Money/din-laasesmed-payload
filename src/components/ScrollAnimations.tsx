'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Samme animationer som originalens GSAP-script: elementet starter usynligt (og 20px forskudt), og når toppen af det er kommet
// op over 80% af skærmhøjden, glider det på plads over 0,6 s med power2.out. Kun én gang. Forsinkelse kommer fra data-delay (ms).
const FROM: Record<string, string> = {
  'fade-up': 'translateY(20px)',
  'fade-down': 'translateY(-20px)',
  'fade-left': 'translateX(20px)',
  'fade-right': 'translateX(-20px)',
}

// Elementer, der allerede er sat i gang. Effekten kan køre flere gange (fx React Strict Mode), og et element må kun animeres én gang.
const started = new WeakSet<Element>()

function play(el: HTMLElement) {
  started.add(el)
  const from = FROM[el.dataset.animate ?? ''] ?? 'none'
  const delay = Number.parseInt(el.dataset.delay ?? '', 10) || 0
  const animation = el.animate(
    [
      { opacity: 0, transform: from },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 600, delay, easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)', fill: 'both' },
  )
  // Når den er færdig, overtager CSS (data-revealed), så elementet ikke har en aktiv animation liggende.
  animation.onfinish = () => {
    el.dataset.revealed = ''
    animation.cancel()
  }
}

/** Finder alle [data-animate]-elementer (også efter sideskift) og animerer dem ind, når de scrolles til. */
export function ScrollAnimations() {
  const pathname = usePathname()

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('[data-animate]:not([data-revealed])')].filter((el) => !started.has(el))
    if (elements.length === 0) return

    // Uden bevægelse: vis med det samme.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const el of elements) {
        el.dataset.animated = ''
        el.dataset.revealed = ''
      }
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // "top 80%": udløses når toppen er over 80% af skærmhøjden, også hvis den allerede er scrollet forbi.
          if (entry.boundingClientRect.top > window.innerHeight * 0.8) continue
          observer.unobserve(entry.target)
          play(entry.target as HTMLElement)
        }
      },
      // Nederste 20% af skærmen holdes uden for, så et element først meldes, når toppen når 80%-linjen.
      { rootMargin: '0px 0px -20% 0px', threshold: 0 },
    )

    for (const el of elements) {
      el.dataset.animated = ''
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [pathname])

  return null
}
