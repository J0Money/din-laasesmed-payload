import fs from 'fs'
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

async function run() {
  const payload = await getPayload({ config })

  const categories = await payload.find({ collection: 'categories', limit: 100 })
  const categoryIdBySlug = new Map(categories.docs.map((doc) => [doc.slug, doc.id]))

  const articles = await payload.find({ collection: 'articles', limit: 1000 })
  const articleIdBySlug = new Map(articles.docs.map((doc) => [doc.slug, doc.id]))

  function categoryRef(slug: string) {
    const id = categoryIdBySlug.get(slug)
    if (!id) throw new Error(`Kategori "${slug}" findes ikke`)
    return { relationTo: 'categories' as const, value: id }
  }

  function categoryLink(label: string, slug: string) {
    return { link: { type: 'reference' as const, label, reference: categoryRef(slug) } }
  }

  // Mega-menuens undermenupunkter peger på artikler, så ikonet i menuen altid er artiklens eget hovedbillede.
  function articleLink(label: string, slug: string) {
    const id = articleIdBySlug.get(slug)
    if (!id) throw new Error(`Artikel "${slug}" findes ikke`)
    return { link: { type: 'reference' as const, label, reference: { relationTo: 'articles' as const, value: id } } }
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

  // --- Certificeringslogo (ISO), hentet fra originalens footer ---
  let certificationLogoId: string | undefined
  const isoAlt = 'ISO 9001 certificeret'
  const existingIso = await payload.find({ collection: 'media', where: { alt: { equals: isoAlt } } })
  if (existingIso.docs[0]) {
    certificationLogoId = String(existingIso.docs[0].id)
  } else {
    const res = await fetch('https://cdn.prod.website-files.com/68219f1c6821c86ed6240d9e/68271eec709f6fa497081850_iso-logo.avif')
    const buffer = Buffer.from(await res.arrayBuffer())
    const doc = await payload.create({
      collection: 'media',
      data: { alt: isoAlt },
      file: { name: 'iso-logo.avif', data: buffer, mimetype: 'image/avif', size: buffer.length },
    })
    certificationLogoId = String(doc.id)
  }

  // --- Site settings (tekster 1:1 fra originalens footer, inkl. "Abyhøj" og "2575 1297") ---
  await payload.updateGlobal({
    slug: 'siteSettings',
    data: {
      logo: logoId,
      certificationLogo: certificationLogoId,
      linkedin: 'https://www.linkedin.com/company/din-l%C3%A5sesmed-a-s/',
      companyName: 'Din Låsesmed A/S',
      cvr: '41013141',
      address: 'Silkeborgvej 329, 8230 Åbyhøj',
      phone: '86 20 66 00',
      email: 'info@din-laasesmed.dk',
      openingHours: [
        { label: 'Mandag - torsdag', hours: '08.00 - 16.00' },
        { label: 'Fredag', hours: '08.00 - 15.00' },
        { label: 'Døgnvagt service', hours: '16.00 - 08.00' },
      ],
      departments: [
        {
          name: 'Butik i Aarhus',
          address: 'Silkeborgvej 329, 8230 Abyhøj',
          phone: '86 20 66 00',
          email: 'info@din-laasesmed.dk',
        },
        {
          name: 'Butik i Aalborg',
          address: 'Gasværksvej 44, 9000 Aalborg',
          phone: '2575 1297',
          email: 'info@din-laasesmed.dk',
        },
      ],
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
        {
          ...customLink('Formular', '/formular'),
          children: [customLink('Formularer', '/formular'), customLink('Nøgleformular', '/noegleformular')],
        },
        { ...customLink('ISO 9001', '/iso-9001'), children: [] },
        { ...customLink('Job', '/ledige-stillinger'), children: [] },
        { ...categoryLink('Nyt', 'nyheder'), children: [] },
      ],
      navItems: [
        {
          ...categoryLink('Mekanisk sikring', 'mekanisk-sikring'),
          children: [
            articleLink('Værdiskabe', 'vaerdiskabe'),
            articleLink('Magnetlåse', 'magnetlase'),
            articleLink('Hængelåse', 'haengelase'),
            articleLink('Vindueslåse', 'vindueslase'),
            articleLink('Låsesystemer mekanisk', 'lasesystemer-mekanisk'),
            articleLink('Nøgler', 'nogler'),
            articleLink('Oplukning af dør', 'oplukning-af-doer'),
            articleLink('Cylindere', 'cylindere'),
          ],
        },
        {
          ...categoryLink('Elektronisk sikring', 'elektronisk-sikring'),
          children: [
            articleLink('Dørtelefoni', 'dortelefoni'),
            articleLink('iLOQ låsesystem', 'iloq-lasesystem'),
            articleLink('Adgangskontrol', 'adgangskontrol'),
            articleLink('Låsesystemer elektronisk', 'lasesystemer-elektronisk'),
            articleLink('Videoovervågning', 'videoovervagning'),
            articleLink('Dørautomatik', 'dorautomatik'),
            articleLink('Dørlukker', 'dorlukker'),
          ],
        },
        {
          ...categoryLink('Service', 'service'),
          children: [
            articleLink('Skal du ud og rejse?', 'skal-du-ud-og-rejse'),
            articleLink('Uforpligtende servicetjek', 'uforpligtende-servicetjek'),
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
        customLink('Find låsesmed', '/artikler/find-lasesmed'),
        customLink('Brand Info', '/artikler/brand-info-side'),
        customLink('Cookie- og privatlivspolitik', '/cookie-og-privatlivspolitik'),
        { link: { type: 'custom' as const, label: 'Searchmind', url: 'https://www.searchmind.dk/', newTab: true } },
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
