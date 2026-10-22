import { parse } from 'csv-parse/sync'
import fs from 'fs'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '../src/payload.config.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const csv = fs.readFileSync(path.resolve(dirname, '../data/webflow-export/articles.csv'), 'utf-8')
const rows: Record<string, string>[] = parse(csv, { columns: true, relax_quotes: true, skip_empty_lines: true })

const toIso = (value: string | undefined) => (value ? new Date(value).toISOString() : undefined)

/** Overfører Webflows "Published On"/"Created On", så sortering matcher originalen. */
async function run() {
  const payload = await getPayload({ config })

  for (const row of rows) {
    const existing = await payload.find({ collection: 'articles', where: { slug: { equals: row.Slug } }, limit: 1, draft: true })
    const doc = existing.docs[0]
    if (!doc) continue

    await payload.update({
      collection: 'articles',
      id: doc.id,
      data: {
        publishedAt: toIso(row['Published On']) ?? null,
        createdAt: toIso(row['Created On']),
        _status: doc._status ?? 'published',
      },
    })
  }

  const check = await payload.find({ collection: 'articles', where: { slug: { equals: 'iloq-lasesystem' } }, limit: 1 })
  console.log('Kontrol iLOQ:', check.docs[0]?.publishedAt, check.docs[0]?.createdAt)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
