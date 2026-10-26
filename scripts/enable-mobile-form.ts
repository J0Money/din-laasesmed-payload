// Slår "Vis formularen over kortene på tablet og mobil" til på Kontakt og Aalborg, som på originalen.
// Kør: node --env-file=.env.local --import tsx scripts/enable-mobile-form.ts
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function run() {
  const payload = await getPayload({ config })
  for (const [slug, on] of [['kontakt', true], ['laasesmed-aalborg', false]] as const) {
    const found = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })
    const page: any = found.docs[0] // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!page) continue
    const layout = (page.layout ?? []).map((block: any) => (block.blockType === 'contactCards' ? { ...block, mobileForm: on } : block)) // eslint-disable-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'pages', id: page.id, data: { layout } as any, draft: false }) // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log(`${slug}: mobileForm: ${on}`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
