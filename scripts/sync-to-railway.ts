// Synker indhold fra den lokale database (DATABASE_URI) til Railway (RAILWAY_DATABASE_URI).
// Overskriver kun de collections og globals, der står nedenfor, og efterlader brugere og indstillinger i admin urørt.
// Viser kun forskellene, medmindre --apply gives.
// Kør: node --env-file=.env.local --import tsx scripts/sync-to-railway.ts [--apply]
// Skriver filer, der skal sendes til volumen, til media-sync.txt (stier relativt til /app/media).
import { writeFileSync } from 'node:fs'

import { MongoClient } from 'mongodb'

const GLOBALS = ['header', 'footer', 'siteSettings']

/** Indhold der erstattes dokument for dokument (på _id). Dokumenter kun på Railway slettes ikke. */
const COLLECTIONS = [
  'pages', '_pages_versions',
  'articles', '_articles_versions',
  'brands', '_brands_versions',
  'categories', '_categories_versions',
  'employees',
  'jobs', '_jobs_versions',
  'forms',
  'videos',
]

// Nøgle-rækkefølge og updatedAt er ligegyldige, når man vurderer om et dokument er ændret.
const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && typeof v.toHexString !== 'function'
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )
const sameDoc = (a: Record<string, unknown>, b: Record<string, unknown>) =>
  stable({ ...a, updatedAt: 0 }) === stable({ ...b, updatedAt: 0 })

async function run() {
  const apply = process.argv.includes('--apply')
  const source = new MongoClient(process.env.DATABASE_URI!)
  // Tunnelens port skifter hver gang: RAILWAY_TUNNEL_PORT overstyrer porten i RAILWAY_DATABASE_URI.
  const tunnelPort = process.env.RAILWAY_TUNNEL_PORT
  const targetUri = tunnelPort
    ? process.env.RAILWAY_DATABASE_URI!.replace(/@([^:/]+):\d+/, `@$1:${tunnelPort}`)
    : process.env.RAILWAY_DATABASE_URI!
  const target = new MongoClient(targetUri)
  await Promise.all([source.connect(), target.connect()])
  const src = source.db()
  const dst = target.db()

  // Globals
  for (const doc of await src.collection('globals').find({ globalType: { $in: GLOBALS } }).toArray()) {
    const existing = await dst.collection('globals').findOne({ globalType: doc.globalType })
    const state = !existing ? 'ny' : sameDoc(existing, doc) ? 'ens' : 'ændret'
    console.log(`global ${doc.globalType}: ${state}`)
    if (apply && state !== 'ens') {
      await dst.collection('globals').deleteMany({ globalType: doc.globalType })
      await dst.collection('globals').insertOne(doc)
    }
  }

  // Collections
  for (const name of COLLECTIONS) {
    const docs = await src.collection(name).find({}).toArray()
    const existing = new Map((await dst.collection(name).find({}).toArray()).map((d) => [String(d._id), d]))
    let created = 0
    let changed = 0
    let same = 0
    const writes = []
    for (const doc of docs) {
      const old = existing.get(String(doc._id))
      if (!old) created++
      else if (sameDoc(old, doc)) same++
      else changed++
      if (!old || !sameDoc(old, doc)) writes.push({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })
    }
    const onlyRailway = [...existing.keys()].filter((id) => !docs.some((d) => String(d._id) === id)).length
    console.log(`${name.padEnd(24)} lokal ${String(docs.length).padStart(3)} | nye ${String(created).padStart(3)} | ændrede ${String(changed).padStart(3)} | ens ${String(same).padStart(3)}${onlyRailway ? ` | kun på Railway ${onlyRailway}` : ''}`)
    if (apply && writes.length) await dst.collection(name).bulkWrite(writes)
  }

  // Medier: nye dokumenter oprettes, og ændrede erstattes (fx et billede der er byttet ud). Dokumenter kun på Railway slettes ikke.
  const dstMedia = new Map((await dst.collection('media').find({}).toArray()).map((d) => [String(d._id), d]))
  const srcMedia = await src.collection('media').find({}).toArray()
  const newMedia = srcMedia.filter((d) => !dstMedia.has(String(d._id)))
  const changedMedia = srcMedia.filter((d) => dstMedia.has(String(d._id)) && !sameDoc(dstMedia.get(String(d._id))!, d))
  console.log(`media                    nye dokumenter: ${newMedia.length} | ændrede: ${changedMedia.length}`)
  for (const d of changedMedia) {
    console.log(`  ændret: ${d._id} ${dstMedia.get(String(d._id))?.filename} -> ${d.filename} (${d.width}x${d.height})`)
  }
  const files = [...newMedia, ...changedMedia].flatMap((d) => [
    d.filename,
    ...Object.values((d.sizes ?? {}) as Record<string, { filename?: string }>).map((s) => s?.filename),
  ]).filter(Boolean)
  // Videofiler ligger i media/videos.
  for (const video of await src.collection('videos').find({}).toArray()) if (video.filename) files.push(`videos/${video.filename}`)
  writeFileSync('media-sync.txt', files.join('\n'))
  console.log(`  ${files.length} filer skrevet til media-sync.txt`)
  if (apply && newMedia.length) await dst.collection('media').insertMany(newMedia)
  if (apply && changedMedia.length) {
    await dst.collection('media').bulkWrite(changedMedia.map((d) => ({ replaceOne: { filter: { _id: d._id }, replacement: d } })))
  }

  await Promise.all([source.close(), target.close()])
  console.log(apply ? 'Anvendt.' : 'Kun visning, kør med --apply for at skrive.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
