import type { Metadata } from 'next'
import type React from 'react'

import { archivo, montserrat } from '@/lib/fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Din Låsesmed',
  description: 'Din Låsesmed i Aarhus — under opbygning.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${montserrat.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  )
}
