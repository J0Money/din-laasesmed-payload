import type { Metadata } from 'next'
import type React from 'react'

import { AlertBar } from '@/components/layout/AlertBar'
import { ScrollAnimations } from '@/components/ScrollAnimations'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { Footer } from '@/components/layout/Footer'
import { FocusHeader } from '@/components/layout/FocusHeader'
import { Header } from '@/components/layout/Header'
import { PathSwitch } from '@/components/layout/PathSwitch'
import { archivo, montserrat } from '@/lib/fonts'
import { ROUTES } from '@/lib/routes'
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
        <SchemaMarkup />
        {/* Prisberegneren har kun logo og telefonnummer i toppen, så besøgende ikke fristes til at forlade den. */}
        <PathSwitch path={ROUTES.priceCalculator()} focus={<FocusHeader />}>
          <AlertBar />
          <Header />
        </PathSwitch>
        {children}
        <Footer />
        <ScrollAnimations />
        <ScrollToTop />
      </body>
    </html>
  )
}
