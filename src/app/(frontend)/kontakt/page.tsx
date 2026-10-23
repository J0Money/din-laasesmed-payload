import type { Metadata } from 'next'
import Link from 'next/link'

import { DepartmentContactPage } from '@/components/contact/DepartmentContactPage'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Kontakt Din Låsesmed i Aarhus | Få hjælp til låse og sikkerhed',
}

/** Aarhus-afdelingen; "Afdelinger → Aarhus afdeling" peger hertil som på originalen. */
export default async function ContactPage() {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'siteSettings' })
  const aarhus = siteSettings.departments?.[0]

  return (
    <DepartmentContactPage
      phone={siteSettings.phone ?? ''}
      // Butikkens adresse står som på originalen (inkl. "Abyhøj"), derfor fra afdelingen og ikke virksomhedsadressen.
      address={aarhus?.address ?? siteSettings.address ?? ''}
      email={siteSettings.email ?? ''}
      heading="Kontakt Din Låsesmed"
    >
      <div className="rich-text [&>:last-child]:mb-0">
        <p>
          Har du brug for hjælp til låse, adgangskontrol eller anden sikring? Hos Din Låsesmed står vi klar til at
          rådgive dig – uanset om det drejer sig om en akut situation eller et større projekt. Vi dækker hele{' '}
          <Link href={ROUTES.article('find-lasesmed')}>Aarhus og omegn</Link> og er kun et opkald eller en mail væk.
        </p>
        <p>Vi ser frem til at høre fra dig!</p>
      </div>
    </DepartmentContactPage>
  )
}
