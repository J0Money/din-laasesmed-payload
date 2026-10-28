import type { Metadata } from 'next'

import { NotFoundView } from '@/components/NotFoundView'
import { archivo, montserrat } from '@/lib/fonts'
import '@/styles/globals.css'

export const metadata: Metadata = { title: 'Siden findes ikke | Din Låsesmed' }

// Bruges til adresser, der ikke matcher nogen side (fx /a/b/c). Springer layoutet over, så den skal selv hente skrifttyper og styles.
export default function GlobalNotFound() {
  return (
    <html lang="da" className={`${montserrat.variable} ${archivo.variable}`}>
      <body>
        <NotFoundView />
      </body>
    </html>
  )
}
