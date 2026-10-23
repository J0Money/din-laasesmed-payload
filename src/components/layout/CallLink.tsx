'use client'

import { usePathname } from 'next/navigation'

import { ROUTES } from '@/lib/routes'

/** "2575 1297" → "25 75 12 97", samme parvise visning som hovednummeret. */
const formatPhone = (phone: string) => phone.replace(/\s/g, '').replace(/(\d{2})(?=\d)/g, '$1 ')

/**
 * Topbjælkens "Ring til"-nummer. Originalen forsøger at skifte til Aalborgs nummer på Aalborg-siden,
 * men dens script tjekker "/laasemed-aalborg" (stavefejl) og virker derfor aldrig; her virker skiftet.
 */
export function CallLink({ phone, aalborgPhone }: { phone: string; aalborgPhone?: null | string }) {
  const pathname = usePathname()
  const shown = aalborgPhone && pathname === ROUTES.contactAalborg() ? formatPhone(aalborgPhone) : phone

  return (
    <span>
      Ring til <a href={`tel:${shown.replace(/\s/g, '')}`}>{shown}</a>
    </span>
  )
}
