// Uploader alle filer fra mediemappen til bucketen (én gang, når man skifter fra volume til bucket).
// Køres på Railway, hvor S3_*-variablerne findes:  railway ssh --service din-laasesmed-payload -- node scripts/upload-media-to-bucket.mjs
// Filer, der allerede ligger i bucketen, springes over. Tilføj --dry-run for kun at se, hvad der ville blive uploadet.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const dir = process.env.MEDIA_STATIC_DIR || '/app/media'
const dryRun = process.argv.includes('--dry-run')
const { S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env

if (!S3_BUCKET || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
  console.error('Mangler S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID eller S3_SECRET_ACCESS_KEY.')
  process.exit(1)
}

const client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION || 'auto',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
})

const types = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

const exists = async (key) => {
  try {
    await client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

let uploaded = 0
let skipped = 0
for (const entry of await readdir(dir, { withFileTypes: true })) {
  if (!entry.isFile()) continue
  if (await exists(entry.name)) {
    skipped++
    continue
  }
  if (!dryRun) {
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: entry.name,
        Body: await readFile(path.join(dir, entry.name)),
        ContentType: types[path.extname(entry.name).toLowerCase()] || 'application/octet-stream',
      }),
    )
  }
  uploaded++
  console.log(`${dryRun ? 'ville uploade' : 'uploadet'}: ${entry.name}`)
}
console.log(`Færdig. ${dryRun ? 'Ville uploade' : 'Uploadet'}: ${uploaded}, sprunget over: ${skipped}.`)
