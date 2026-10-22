import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '../src/payload.config.js'
import { extractVideos, injectVideoBlocks } from './lib/webflowVideos.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const csv = fs.readFileSync(path.resolve(dirname, '../data/webflow-export/articles.csv'), 'utf-8')
const rows: Record<string, string>[] = parse(csv, { columns: true, relax_quotes: true, skip_empty_lines: true })

async function run() {
  const payload = await getPayload({ config })
  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config)

  for (const row of rows) {
    const { html, videos } = extractVideos(row['Main text'] || '')
    if (!videos.length) continue

    const existing = await payload.find({ collection: 'articles', where: { slug: { equals: row.Slug } }, limit: 1 })
    const doc = existing.docs[0]
    if (!doc) continue

    const mainText = injectVideoBlocks(convertHTMLToLexical({ editorConfig, html, JSDOM }), videos)
    await payload.update({
      collection: 'articles',
      id: doc.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { mainText: mainText as any, _status: doc._status ?? 'published' },
    })
    console.log(`  ✓ ${row.Name}: ${videos.length} video(er) tilføjet`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
