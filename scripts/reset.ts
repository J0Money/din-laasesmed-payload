import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function run() {
  const payload = await getPayload({ config })
  for (const slug of ['articles', 'categories', 'brands', 'employees', 'pages', 'media'] as const) {
    const result = await payload.find({ collection: slug, limit: 1000, depth: 0 })
    for (const doc of result.docs) {
      await payload.delete({ collection: slug, id: doc.id })
    }
    console.log(`Ryddet ${slug}: ${result.totalDocs} dokumenter slettet`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
