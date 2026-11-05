'use client'

import { usePathname } from 'next/navigation'
import type React from 'react'

/** Viser "focus" på den angivne sti og ellers children. Begge dele er server-komponenter, der er sendt ind som props. */
export function PathSwitch({ children, focus, path }: { children: React.ReactNode; focus: React.ReactNode; path: string }) {
  return usePathname() === path ? focus : children
}
