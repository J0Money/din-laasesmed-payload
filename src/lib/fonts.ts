import { Archivo, Montserrat } from 'next/font/google'

export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
})
