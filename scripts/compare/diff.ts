// Sammenligner to JSON-snapshots (fx lavet med extract.js / extract-home.js) og udskriver kun det der afviger.
// Kør: pnpm tsx scripts/compare/diff.ts [prefix]  — uden prefix: local.json/live.json, med "home": home-local.json/home-live.json
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PX_TOLERANCE = 2

const dir = dirname(fileURLToPath(import.meta.url))
const prefix = process.argv[2] ? `${process.argv[2]}-` : ''
const local = JSON.parse(readFileSync(join(dir, `${prefix}local.json`), 'utf-8'))
const live = JSON.parse(readFileSync(join(dir, `${prefix}live.json`), 'utf-8'))

function diffValue(path: string, a: unknown, b: unknown, out: string[]) {
  if (a === null || b === null) {
    if (a !== b) out.push(`${path}: local=${JSON.stringify(a)} live=${JSON.stringify(b)}`)
    return
  }
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) > PX_TOLERANCE) out.push(`${path}: local=${a} live=${b} (diff ${a - b})`)
    return
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)])
    for (const key of keys) {
      diffValue(`${path}.${key}`, (a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], out)
    }
    return
  }
  if (a !== b) out.push(`${path}: local=${JSON.stringify(a)} live=${JSON.stringify(b)}`)
}

const diffs: string[] = []
const keys = new Set([...Object.keys(local), ...Object.keys(live)])
for (const key of keys) {
  diffValue(key, local[key], live[key], diffs)
}

if (diffs.length === 0) {
  console.log('Ingen afvigelser (inden for 2px / identiske værdier).')
} else {
  console.log(`${diffs.length} afvigelse(r):\n`)
  for (const d of diffs) console.log(`  ✗ ${d}`)
}
