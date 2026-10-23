'use client'

import { useEffect, useRef } from 'react'

// Originalens statistik-bånd har et baggrundsbillede ~140% af båndets højde, der glider op mens man scroller forbi.
export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = ref.current
    const section = img?.parentElement
    if (!img || !section) return

    let frame = 0
    function update() {
      frame = 0
      const rect = section!.getBoundingClientRect()
      const travel = img!.offsetHeight - rect.height
      const progress = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1)
      img!.style.transform = `translate3d(0, ${-progress * travel}px, 0)`
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className="absolute inset-x-0 top-0 h-[140%] w-full object-cover will-change-transform" />
}
