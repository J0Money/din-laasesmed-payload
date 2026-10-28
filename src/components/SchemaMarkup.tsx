import { mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { SITE_URL } from '@/lib/seo'

// Samme tekst som originalens strukturerede data, bruges når standard-beskrivelsen ikke er udfyldt i admin.
const FALLBACK_DESCRIPTION = 'Din Låsesmed er din lokale låsesmed i Århus Kommune med låseservice døgnet rundt hele året.'

const absolute = (url?: string) => (url ? (url.startsWith('http') ? url : `${SITE_URL}${url}`) : undefined)

/** "Silkeborgvej 329, 8230 Åbyhøj" → gade, postnummer og by. Kan adressen ikke deles, bruges den samlet som gade. */
function postalAddress(address: string) {
  const [street, rest] = address.split(',').map((part) => part.trim())
  const match = rest?.match(/^(\d{4})\s+(.+)$/)
  return match
    ? { '@type': 'PostalAddress', streetAddress: street, postalCode: match[1], addressLocality: match[2], addressCountry: 'DK' }
    : { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'DK' }
}

/** LocalBusiness som JSON-LD på alle sider, som originalen, bygget af Konfiguration > Indstillinger. Tomme felter udelades. */
export async function SchemaMarkup() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })

  const sameAs = [settings.facebook, settings.instagram, settings.linkedin].filter(Boolean)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Din Låsesmed',
    url: SITE_URL,
    description: settings.defaultMetaDescription?.trim() || FALLBACK_DESCRIPTION,
    address: settings.address ? postalAddress(settings.address) : undefined,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    vatID: settings.cvr || undefined,
    logo: absolute(mediaUrl(settings.logo)),
    image: absolute(mediaUrl(settings.ogImage, 'og')),
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }

  // "<" escapes, så en tekst i admin aldrig kan lukke script-tagget.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
