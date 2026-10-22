import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function run() {
  const payload = await getPayload({ config })
  for (const slug of ['categories', 'articles', 'brands', 'employees', 'pages', 'media'] as const) {
    const result = await payload.find({ collection: slug, limit: 100, depth: 0 })
    console.log(`\n${slug} (${result.totalDocs}):`)
    for (const doc of result.docs) {
      console.log(`  - ${doc.id}: ${(doc as any).name || (doc as any).title || (doc as any).filename}`)
    }
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
