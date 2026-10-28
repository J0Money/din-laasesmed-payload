'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

// Som originalens statistik-bånd: fra 992px har billedet sit eget billedformat (højst 140% af båndets højde) og glider
// fra -40% til 0 mens båndet scroller forbi (kun fra 1024px). Under 992px fylder billedet bare båndet.
export function ParallaxImage({ src, alt, width = 1920, height = 1080 }: { src: string; alt: string; width?: number; height?: number }) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = ref.current
    const section = img?.parentElement
    if (!img || !section) return

    let frame = 0
    function update() {
      frame = 0
      if (window.innerWidth < 1024) {
        img!.style.transform = ''
        return
      }
      const rect = section!.getBoundingClientRect()
      const progress = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1)
      img!.style.transform = `translate3d(0, ${-0.4 * (1 - progress) * img!.offsetHeight}px, 0)`
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

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="100vw"
      className="absolute inset-0 h-auto max-h-[140%] w-full object-cover will-change-transform max-[991px]:h-full max-[991px]:max-h-full"
    />
  )
}
