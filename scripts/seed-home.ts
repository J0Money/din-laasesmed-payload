// Udfylder forsidens indhold (Home-global): billeder hentet fra din-laasesmed.dk,
// kundeudtalelse, statistik-tal og erhvervskunder. Kør: node --env-file=.env.local --import tsx scripts/seed-home.ts
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function run() {
  const payload = await getPayload({ config })

  async function mediaFromUrl(alt: string, url: string, filename: string, mimetype: string) {
    const existing = await payload.find({ collection: 'media', where: { alt: { equals: alt } }, limit: 1 })
    if (existing.docs[0]) return String(existing.docs[0].id)

    const res = await fetch(url)
    const buffer = Buffer.from(await res.arrayBuffer())
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { name: filename, data: buffer, mimetype, size: buffer.length },
    })
    return String(doc.id)
  }

  // Forsidens eget portrætbillede (576x1024). Medarbejderfotoet af Anders er en beskåret 576x384-udgave og kan ikke genbruges.
  const visualImageId = await mediaFromUrl(
    'Anders daglig leder i Aarhus butikken.',
    'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/682accd2a265259227614cce_DSC07388_576x1024.avif',
    'anders-aarhus-butik.avif',
    'image/avif',
  )

  // "Åben varevogn" er allerede migreret fra Webflow og genbruges som baggrund i statistik-båndet.
  const statsImage = await payload.find({ collection: 'media', where: { filename: { contains: 'varevogn' } }, limit: 1 })
  const statsImageId = statsImage.docs[0] ? String(statsImage.docs[0].id) : undefined

  const mekaniskImageId = await mediaFromUrl(
    'Mekanisk sikring — produktbillede',
    'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/68b7e9899bc9b092b7291f9b_ruko-home-product.avif',
    'ruko-home-product.avif',
    'image/avif',
  )
  const elektroniskImageId = await mediaFromUrl(
    'Elektronisk sikring — produktbillede',
    'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/68b7e989543bf4f64e0c78a7_salto-home-product.avif',
    'salto-home-product.avif',
    'image/avif',
  )
  const serviceImageId = await mediaFromUrl(
    'Servicetjek — varevogn',
    'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6824884607b4fedef2faba94_truck.avif',
    'truck.avif',
    'image/avif',
  )

  const customerSources: { alt: string; url: string; filename: string; type: 'logo' | 'photo'; label?: string; bgColor?: string; logoHeight?: number }[] = [
    {
      alt: 'Trianglen logo',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/68249a1429275d5c2053b09a_trianglen.avif',
      filename: 'trianglen.avif',
      type: 'logo',
      bgColor: '#d88e6d',
      logoHeight: 144,
    },
    {
      alt: 'Erhvervskunde i Aarhus',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4fd396adf6d7a82e7c_0f34b3c96953bc68681730b78c99af82_AARhus.avif',
      filename: 'aarhus.avif',
      type: 'photo',
      label: 'AArhus',
    },
    {
      alt: 'Den Gamle By logo',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4f6592f0c9267c30eb_Den_Gamle_By_-_Logo.avif',
      filename: 'den-gamle-by-logo.avif',
      type: 'logo',
      bgColor: '#002993',
    },
    {
      alt: 'Erhvervskunde på Trøjborgvej',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4f3c75a59ac720211c_IMG_2750-1536x1152.avif',
      filename: 'trojborgvej.avif',
      type: 'photo',
      label: 'Trøjborgvej',
    },
    {
      alt: 'Tivoli Friheden logo',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4fecfd4b641309e492_tivoli.webp',
      filename: 'tivoli-friheden-logo.webp',
      type: 'logo',
    },
    {
      alt: 'Silkeborg Gymnasium',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc5039aa3af215b88052_40b082b72ddfcfe9522afc30ea03ac00_imengine.public.mhm.infomaker.avif',
      filename: 'silkeborg-gymnasium.avif',
      type: 'photo',
      label: 'Silkeborg Gymnasium',
    },
    {
      alt: 'Erhvervskunde-logo',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4f4571d69b0146aabd_logo.avif',
      filename: 'erhvervskunde-logo.avif',
      type: 'logo',
      bgColor: '#c5003d',
    },
    {
      alt: 'Nobelparken',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4f89dd35c546d19ef0_Nobelparken_02.avif',
      filename: 'nobelparken.avif',
      type: 'photo',
      label: 'NOBELPARKEN',
    },
    {
      alt: 'AarBus logo',
      url: 'https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/6826fc4f757b0263a103545a_Aarbus_logo__sort_skygge-300x61.avif',
      filename: 'aarbus-logo.avif',
      type: 'logo',
      bgColor: '#ffd61b',
    },
  ]

  const businessCustomers = []
  for (const source of customerSources) {
    const mimetype = source.filename.endsWith('.webp') ? 'image/webp' : 'image/avif'
    const id = await mediaFromUrl(source.alt, source.url, source.filename, mimetype)
    businessCustomers.push({ image: id, label: source.label, type: source.type, bgColor: source.bgColor, logoHeight: source.logoHeight ?? 96 })
  }

  await payload.updateGlobal({
    slug: 'home',
    data: {
      visual: {
        image: visualImageId,
        ctaLabel: 'Besøg os i Aarhus',
      },
      // Teksterne er 1:1 fra originalen, inkl. citationstegn og "Aarbus".
      testimonials: [
        {
          quote: '"Vi sætter stor pris på Din Låsesmeds store faglighed og fleksible samarbejde."',
          author: 'Bent Høyer Laursen fra Aarbus',
        },
        {
          quote:
            '"Din Låsesmed har gennem en årrække været en god og stabil samarbejdspartner i flere af vores boligafdelinger. De udfører altid et hurtigt og professionelt arbejde, som vi sætter stor pris på."',
          author: 'Boligforeningen Århus Omegn',
        },
        {
          quote:
            'Vi har været meget tilfredse med vores samarbejde med Din Låsesmed. De leverer en pålidelig og professionel service og har vist stor fleksibilitet og faglighed i deres tilgang til opgaverne på vores kraftvarmeværk i Lisbjerg.',
          author: 'Thorbjørn fra Energipark Lisbjerg',
        },
      ],
      statsImage: statsImageId,
      stats: [
        { value: 10000, label: 'Kunder' },
        { value: 1600, label: 'Akut udkald' },
        { value: 15000, label: 'Nøgler skåret årligt' },
        { value: 4000, label: 'Besøg i butikken' },
      ],
      focusCards: {
        mekaniskImage: mekaniskImageId,
        elektroniskImage: elektroniskImageId,
        serviceImage: serviceImageId,
      },
      businessCustomers,
    },
  })

  console.log('Home-globalen er udfyldt.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
