// Synker globals og nye medie-dokumenter fra den lokale database (DATABASE_URI) til Railway (RAILWAY_DATABASE_URI),
// uden at røre andet indhold derovre. Viser kun forskellene, medmindre --apply gives.
// Kør: node --env-file=.env.local --import tsx scripts/sync-to-railway.ts [--apply]
// Skriver de nye mediefilnavne til media-sync.txt, så filerne kan pakkes og sendes til volumen.
import { writeFileSync } from 'node:fs'

import { MongoClient } from 'mongodb'

const GLOBALS = ['header', 'footer', 'siteSettings']

async function run() {
  const apply = process.argv.includes('--apply')
  const source = new MongoClient(process.env.DATABASE_URI!)
  const target = new MongoClient(process.env.RAILWAY_DATABASE_URI!)
  await Promise.all([source.connect(), target.connect()])
  const src = source.db()
  const dst = target.db()

  const srcGlobals = await src.collection('globals').find({ globalType: { $in: GLOBALS } }).toArray()
  for (const doc of srcGlobals) {
    const existing = await dst.collection('globals').findOne({ globalType: doc.globalType })
    const same = existing && JSON.stringify({ ...existing, updatedAt: 0 }) === JSON.stringify({ ...doc, updatedAt: 0 })
    console.log(`global ${doc.globalType}: ${!existing ? 'mangler' : same ? 'ens' : 'ændret'}`)
    if (apply && !same) {
      await dst.collection('globals').deleteMany({ globalType: doc.globalType })
      await dst.collection('globals').insertOne(doc)
    }
  }

  const dstMediaIds = new Set((await dst.collection('media').find({}, { projection: { _id: 1 } }).toArray()).map((d) => String(d._id)))
  const newMedia = (await src.collection('media').find({}).toArray()).filter((d) => !dstMediaIds.has(String(d._id)))
  console.log(`media: ${newMedia.length} nye dokumenter`)
  const files = newMedia.flatMap((d) => [
    d.filename,
    ...Object.values((d.sizes ?? {}) as Record<string, { filename?: string }>).map((s) => s?.filename),
  ]).filter(Boolean)
  writeFileSync('media-sync.txt', files.join('\n'))
  console.log(`  ${files.length} filer skrevet til media-sync.txt`)
  if (apply && newMedia.length) await dst.collection('media').insertMany(newMedia)

  await Promise.all([source.close(), target.close()])
  console.log(apply ? 'Anvendt.' : 'Kun visning, kør med --apply for at skrive.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
