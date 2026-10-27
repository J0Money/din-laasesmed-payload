import type { Metadata } from 'next'
import type React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { archivo, montserrat } from '@/lib/fonts'
import { SITE_URL } from '@/lib/seo'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Din Låsesmed',
}

// Header/Footer henter fra databasen på hver side. Uden dette prøver Next.js at prerendere
// sider ved build, hvilket fejler når databasen (Railways private netværk) ikke kan nås under build.
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${montserrat.variable} ${archivo.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
