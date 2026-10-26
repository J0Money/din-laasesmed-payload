// Nyheder på originalen viser kun to artikler (Aalborg Låse & Sikring og Find låsesmed). Bynavnene er links i Find låsesmeds tekst.
// Retter den fejl, at by-artiklerne fik kategorien Nyheder. Kør: node --env-file=.env.local --import tsx scripts/fix-nyheder-category.ts
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

const KEEP = ['aalborg-lase-sikring', 'find-lasesmed']

async function run() {
  const payload = await getPayload({ config })
  const categories = await payload.find({ collection: 'categories', where: { slug: { equals: 'nyheder' } }, limit: 1, depth: 0 })
  const nyheder: any = categories.docs[0] // eslint-disable-line @typescript-eslint/no-explicit-any
  const inNyheder = await payload.find({ collection: 'articles', where: { category: { equals: nyheder.id } }, limit: 100, depth: 0, draft: true })
  let removed = 0
  for (const article of inNyheder.docs as any[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (KEEP.includes(article.slug)) continue
    await payload.update({ collection: 'articles', id: article.id, data: { category: null } as any, draft: false }) // eslint-disable-line @typescript-eslint/no-explicit-any
    removed++
  }
  const left = await payload.find({ collection: 'articles', where: { category: { equals: nyheder.id } }, limit: 100, depth: 0, draft: true })
  console.log(`Kategori fjernet på ${removed} artikler. Tilbage i Nyheder: ${(left.docs as any[]).map((a) => a.slug).join(', ')}`) // eslint-disable-line @typescript-eslint/no-explicit-any
  process.exit(0)
}

run().catch((err) => { console.error(err); process.exit(1) })
