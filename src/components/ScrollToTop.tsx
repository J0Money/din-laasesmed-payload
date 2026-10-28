'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Ved sideskift scroller Next.js ned til toppen af selve sidens indhold (main), og det ligger under topbjælken og navigationen.
 * Siden startede derfor ca. 110px nede. Her scrolles der i stedet helt til toppen. Ved første indlæsning og ved #anker røres intet.
 */
export function ScrollToTop() {
  const pathname = usePathname()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    if (window.location.hash) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
