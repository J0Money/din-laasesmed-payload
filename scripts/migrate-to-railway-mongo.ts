// Engangsscript: kopierer alle collections fra den nuværende database (DATABASE_URI, Atlas)
// over i Railways MongoDB (RAILWAY_DATABASE_URI). Kør: node --env-file=.env.local --import tsx scripts/migrate-to-railway-mongo.ts
import { MongoClient } from 'mongodb'

async function run() {
  const sourceUri = process.env.DATABASE_URI
  const targetUri = process.env.RAILWAY_DATABASE_URI

  if (!sourceUri) throw new Error('DATABASE_URI mangler i .env.local')
  if (!targetUri) throw new Error('RAILWAY_DATABASE_URI mangler i .env.local')

  const sourceClient = new MongoClient(sourceUri)
  const targetClient = new MongoClient(targetUri)

  await sourceClient.connect()
  await targetClient.connect()

  const sourceDb = sourceClient.db()
  const targetDb = targetClient.db()

  console.log(`Fra: ${sourceDb.databaseName}  →  Til: ${targetDb.databaseName}\n`)

  const collections = await sourceDb.listCollections().toArray()

  for (const { name } of collections) {
    const sourceCollection = sourceDb.collection(name)
    const docs = await sourceCollection.find({}).toArray()

    if (docs.length === 0) {
      console.log(`  ${name}: 0 dokumenter, springer over`)
      continue
    }

    const targetCollection = targetDb.collection(name)
    await targetCollection.deleteMany({})
    await targetCollection.insertMany(docs)
    console.log(`  ${name}: ${docs.length} dokumenter kopieret`)
  }

  await sourceClient.close()
  await targetClient.close()

  console.log('\nFærdig.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
