import fs from 'fs'
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function run() {
  const payload = await getPayload({ config })

  const categories = await payload.find({ collection: 'categories', limit: 100 })
  const categoryIdBySlug = new Map(categories.docs.map((doc) => [doc.slug, doc.id]))

  function categoryRef(slug: string) {
    const id = categoryIdBySlug.get(slug)
    if (!id) throw new Error(`Kategori "${slug}" findes ikke`)
    return { relationTo: 'categories' as const, value: id }
  }

  function categoryLink(label: string, slug: string) {
    return { link: { type: 'reference' as const, label, reference: categoryRef(slug) } }
  }

  function customLink(label: string, url: string) {
    return { link: { type: 'custom' as const, label, url } }
  }

  // --- Logo ---
  let logoId: string | undefined
  const resolvedLogoPath = process.env.LOGO_PATH

  if (resolvedLogoPath && fs.existsSync(resolvedLogoPath)) {
    const buffer = fs.readFileSync(resolvedLogoPath)
    const existing = await payload.find({ collection: 'media', where: { alt: { equals: 'Din Låsesmed logo' } } })
    if (existing.docs[0]) {
      logoId = String(existing.docs[0].id)
    } else {
      const doc = await payload.create({
        collection: 'media',
        data: { alt: 'Din Låsesmed logo' },
        file: { name: 'din-laasesmed-logo.png', data: buffer, mimetype: 'image/png', size: buffer.length },
      })
      logoId = String(doc.id)
    }
  }

  // --- Site settings ---
  await payload.updateGlobal({
    slug: 'siteSettings',
    data: {
      logo: logoId,
      companyName: 'Din Låsesmed A/S',
      cvr: '41013141',
      address: 'Silkeborgvej 329, 8230 Åbyhøj',
      phone: '86 20 66 00',
      email: 'info@din-laasesmed.dk',
    },
  })

  // --- Header ---
  await payload.updateGlobal({
    slug: 'header',
    data: {
      utilityLinks: [
        {
          ...customLink('Afdelinger', '#'),
          children: [
            customLink('Aarhus afdeling', '/kontakt'),
            customLink('Aalborg afdeling', '/artikler/lasesmed-aalborg'),
          ],
        },
        { ...customLink('Om os', '/om-os'), children: [] },
        { ...customLink('Mærker', '/brands'), children: [] },
        { ...customLink('Formularer', '/formular'), children: [] },
        { ...customLink('Nøgleformular', '/noegleformular'), children: [] },
        { ...customLink('ISO 9001', '/iso-9001'), children: [] },
        { ...customLink('Job', '/ledige-stillinger'), children: [] },
        { ...categoryLink('Nyt', 'nyheder'), children: [] },
      ],
      navItems: [
        {
          ...categoryLink('Mekanisk sikring', 'mekanisk-sikring'),
          children: [
            customLink('Værdiskabe', '/artikler/vaerdiskabe'),
            customLink('Magnetlåse', '/artikler/magnetlase'),
            customLink('Hængelåse', '/artikler/haengelase'),
            customLink('Vindueslåse', '/artikler/vindueslase'),
            customLink('Låsesystemer mekanisk', '/artikler/lasesystemer-mekanisk'),
            customLink('Nøgler', '/artikler/nogler'),
            customLink('Oplukning af dør', '/artikler/oplukning-af-doer'),
            customLink('Cylindere', '/artikler/cylindere'),
          ],
        },
        {
          ...categoryLink('Elektronisk sikring', 'elektronisk-sikring'),
          children: [
            customLink('Dørtelefoni', '/artikler/dortelefoni'),
            customLink('iLOQ låsesystem', '/artikler/iloq-lasesystem'),
            customLink('Adgangskontrol', '/artikler/adgangskontrol'),
            customLink('Låsesystemer elektronisk', '/artikler/lasesystemer-elektronisk'),
            customLink('Videoovervågning', '/artikler/videoovervagning'),
            customLink('Dørautomatik', '/artikler/dorautomatik'),
            customLink('Dørlukker', '/artikler/dorlukker'),
          ],
        },
        {
          ...categoryLink('Service', 'service'),
          children: [
            customLink('Skal du ud og rejse?', '/artikler/skal-du-ud-og-rejse'),
            customLink('Uforpligtende servicetjek', '/artikler/uforpligtende-servicetjek'),
          ],
        },
      ],
      cta: customLink('Kontakt', '/kontakt'),
    },
  })

  // --- Footer ---
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      links: [
        customLink('Om os', '/om-os'),
        customLink('Mærker', '/brands'),
        customLink('ISO 9001', '/iso-9001'),
        customLink('Kontakt', '/kontakt'),
      ],
    },
  })

  console.log('Header, footer og siteSettings er udfyldt.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
