// Sætter medarbejdernes rækkefølge på Om os som på din-laasesmed.dk/om-os, og skjuler dem originalen ikke viser.
// Kør: node --env-file=.env.local --import tsx scripts/seed-employee-order.ts
import { getPayload } from 'payload'

import config from '../src/payload.config'

// Rækkefølgen pr. gruppe, aflæst fra originalen.
const ORDER = [
  'anders', 'brian', 'flemming', 'jan', 'lars', 'mette',
  'tonny', 'sebastian', 'ingo', 'eddie', 'per', 'danny',
  'jan-r', 'malthe',
]

async function run() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'employees', limit: 100, depth: 0 })

  for (const employee of docs) {
    const index = ORDER.indexOf(employee.slug)
    await payload.update({
      collection: 'employees',
      id: employee.id,
      data: { sortOrder: index >= 0 ? index + 1 : null, showOnAbout: index >= 0 },
    })
    console.log(`  ${employee.slug}: ${index >= 0 ? `nr. ${index + 1}` : 'skjult (ikke på originalen)'}`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
