// Henter <title> og meta description for hver mærkeside på din-laasesmed.dk og gemmer dem på mærket.
// Kør: node --env-file=.env.local --import tsx scripts/seed-brand-seo.ts
import { getPayload } from 'payload'

import config from '../src/payload.config'

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

async function run() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'brands', limit: 100, depth: 0, draft: true })

  for (const brand of docs) {
    const res = await fetch(`https://din-laasesmed.dk/brands/${brand.slug}`)
    if (!res.ok) {
      console.log(`  ${brand.slug}: ${res.status}, springer over`)
      continue
    }
    const html = await res.text()
    const titleTag = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '')
    const metaDescription = decode(html.match(/<meta content="([^"]*)" name="description"/)?.[1] ?? html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '')
    await payload.update({
      collection: 'brands',
      id: brand.id,
      data: { titleTag, metaDescription },
      // Opdater den udgivne version direkte, uden at lave en ny kladde.
      draft: false,
    })
    console.log(`  ${brand.slug}: "${titleTag}" / ${metaDescription.length} tegn`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
