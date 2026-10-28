// Flytter SEO-teksterne fra de gamle felter (titleTag, metaDescription) til SEO-pluginets felter (meta.title, meta.description).
// Skriver direkte i databasen, både i de udgivne dokumenter og i alle versioner (admin viser den seneste version),
// så ingen kladde bliver udgivet, og ingen hooks kører. Felter i meta.*, der allerede er udfyldt, røres ikke.
// Viser kun hvad der ville ske, medmindre --apply gives. --railway kører mod RAILWAY_DATABASE_URI i stedet for DATABASE_URI.
// Kør: node --env-file=.env.local --import tsx scripts/migrate-seo-to-plugin.ts [--railway] [--apply]
import { MongoClient } from 'mongodb'

const COLLECTIONS = ['pages', 'articles', 'categories', 'brands']

type SeoData = { meta?: { description?: string | null; title?: string | null } | null; metaDescription?: string | null; titleTag?: string | null }

/** De felter i meta.*, der skal sættes (kun tomme felter med en gammel tekst). */
function changes(data: SeoData | undefined, prefix: string): Record<string, string> {
  const set: Record<string, string> = {}
  if (!data) return set
  if (!data.meta?.title?.trim() && data.titleTag?.trim()) set[`${prefix}meta.title`] = data.titleTag
  if (!data.meta?.description?.trim() && data.metaDescription?.trim()) set[`${prefix}meta.description`] = data.metaDescription
  return set
}

async function run() {
  const apply = process.argv.includes('--apply')
  const railway = process.argv.includes('--railway')
  // Tunnelens port skifter hver gang: RAILWAY_TUNNEL_PORT overstyrer porten i RAILWAY_DATABASE_URI (som i sync-to-railway.ts).
  const tunnelPort = process.env.RAILWAY_TUNNEL_PORT
  const uri = railway
    ? tunnelPort
      ? process.env.RAILWAY_DATABASE_URI!.replace(/@([^:/]+):\d+/, `@$1:${tunnelPort}`)
      : process.env.RAILWAY_DATABASE_URI!
    : process.env.DATABASE_URI!
  console.log(`Database: ${railway ? 'Railway' : 'lokal'}${apply ? '' : ' (tørkørsel, intet skrives)'}`)

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  for (const slug of COLLECTIONS) {
    let docs = 0
    let versions = 0
    for (const doc of await db.collection(slug).find().toArray()) {
      const set = changes(doc as SeoData, '')
      if (Object.keys(set).length === 0) continue
      docs++
      if (apply) await db.collection(slug).updateOne({ _id: doc._id }, { $set: set })
    }
    for (const version of await db.collection(`_${slug}_versions`).find().toArray()) {
      const set = changes(version.version as SeoData, 'version.')
      if (Object.keys(set).length === 0) continue
      versions++
      if (apply) await db.collection(`_${slug}_versions`).updateOne({ _id: version._id }, { $set: set })
    }
    const total = await db.collection(slug).countDocuments()
    console.log(`${slug}: ${docs} af ${total} dokumenter og ${versions} versioner ${apply ? 'opdateret' : 'ville blive opdateret'}`)
  }

  await client.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
