// Laver src/lib/postcodes.ts ud fra GeoNames' postnummerfil for Danmark (prisberegnerens kørselsafstande).
// Hent https://download.geonames.org/export/zip/DK.zip, pak den ud og kør:  node scripts/generate-postcodes.mjs sti/til/DK.txt
// GeoNames-data er under CC BY 4.0, så sitet skal nævne GeoNames (det gør prisberegneren under prisen).
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const input = process.argv[2]
if (!input) {
  console.error('Brug: node scripts/generate-postcodes.mjs sti/til/DK.txt')
  process.exit(1)
}

const rows = (await readFile(input, 'utf8'))
  .trim()
  .split('\n')
  .map((line) => line.split('\t'))
  .filter((columns) => columns[0] === 'DK' && /^\d{4}$/.test(columns[1]))
  .map((columns) => [columns[1], Number(columns[9]), Number(columns[10])])
  .filter(([, lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))
  .sort(([a], [b]) => Number(a) - Number(b))

const body = rows.map(([code, lat, lng]) => `  '${code}': [${lat}, ${lng}],`).join('\n')
const output = `// Genereret af scripts/generate-postcodes.mjs. Ret ikke i hånden.
// Midtpunkt (bredde, længde) for hvert dansk postnummer. Kilde: GeoNames (www.geonames.org), CC BY 4.0.
export const POSTCODE_COORDINATES: Record<string, [number, number]> = {
${body}
}
`

const target = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/lib/postcodes.ts')
await writeFile(target, output)
console.log(`${rows.length} postnumre skrevet til ${target}`)
