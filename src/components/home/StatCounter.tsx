'use client'

import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 1500

function formatDanish(value: number): string {
  return value.toLocaleString('da-DK')
}

export function StatCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let started = false
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return
        started = true

        const start = performance.now()
        function tick(now: number) {
          const progress = Math.min((now - start) / DURATION_MS, 1)
          setDisplay(formatDanish(Math.round(progress * value)))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{display}</span>
}
