// Opretter de to formularer fra din-laasesmed.dk med form builder: "Brug for hjælp?" (kortet ved artikler) og
// Nøgleformular, kobler den første på Site Settings og opretter siden /noegleformular.
// Felter, valg og tekster er aflæst fra originalen. Overskriver aldrig noget, der findes.
// Kør: node --env-file=.env.local --import tsx scripts/seed-forms.ts
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

const THANKS = '/tak-for-din-henvendelse'
const NOTIFY = 'info@din-laasesmed.dk'

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
      },
    ],
  },
})

/* eslint-disable @typescript-eslint/no-explicit-any */
const field = (blockType: string, name: string, label: string, extra: Record<string, any> = {}) => ({
  blockType,
  name,
  label,
  ...extra,
})

const SERVICES: [string, string][] = [
  ['Gratis servicetjek', 'Gratis servicetjek'],
  ['Omkodning af låse', 'Omkodning af låse'],
  ['Montering af nye låse', 'Montering af nye låse'],
  ['Ekstra nøgler', 'Ekstra nøgler'],
  ['Pengeskabe', 'Pengeskabe'],
  ['Adgangskontrol', 'Adgangskontrol'],
  ['Videoovervågning', 'Videoovervågning'],
  ['Dørtelefoni og dørautomatik', 'Dørtelefoni og dørautomatik'],
  ['Erhvervsprojekt', 'Erhverv'],
  ['Andet', 'Andet'],
]

const FORMS: { title: string; data: Record<string, any> }[] = [
  {
    title: 'Brug for hjælp?',
    data: {
      heading: 'Brug for hjælp?',
      subheading: 'Vi kontakter dig inden for 24 timer',
      submitButtonLabel: 'Send forespørgsel',
      errorMessage: 'Noget gik galt, prøv igen eller ring til os.',
      fields: [
        field('text', 'navn', 'Navn', { required: true, placeholder: 'For- og efternavn' }),
        field('select', 'service', 'Service', {
          placeholder: 'Vælg service',
          options: SERVICES.map(([label, value]) => ({ label, value })),
        }),
        field('text', 'telefon', 'Telefonnummer', { required: true, placeholder: '12 34 56 78', mediumLabel: true }),
        field('email', 'mail', 'Mail', { required: true, placeholder: 'mail@gmail.com', mediumLabel: true }),
      ],
    },
  },
  {
    title: 'Nøgleformular',
    data: {
      submitButtonLabel: 'Send forespørgsel',
      errorMessage: 'Noget gik galt, hvis problemet fortsætter må du meget gerne kontakte os telefonisk.',
      fields: [
        field('text', 'navn', 'For- og efternavn', { required: true, placeholder: 'For- og efternavn' }),
        field('text', 'tele', 'Telefonnummer', { required: true, placeholder: 'Telefonnummer' }),
        field('email', 'email', 'E-mail', { required: true, placeholder: 'email@gmail.com', mediumLabel: true }),
        field('text', 'adresse', 'Adresse', { required: true, placeholder: 'Faktureringsadresse', mediumLabel: true }),
        field('text', 'postnr', 'Postnr.', { required: true, placeholder: 'Postnummer', mediumLabel: true }),
        field('text', 'systemnummer', 'Systemnummer', { required: true, placeholder: 'Systemnummer' }),
        field('text', 'noeglemaerkning', 'Nøglemærkning', { placeholder: 'Nøglemærkning' }),
        field('number', 'antal', 'Antal', { required: true, placeholder: 'Antal kopier' }),
        {
          blockType: 'message',
          message: paragraph('Du kan afhente dine nøgler i en af vores afdelinger (Aalborg & Aarhus)'),
        },
        field('checkbox', 'levering', 'Jeg ønsker levering'),
        field('text', 'navn_levering', 'Navn på leveringen', { placeholder: 'Navn på levering', showWhen: 'levering' }),
        field('text', 'adresse_levering', 'Adresse', { placeholder: 'leveringsadresse', showWhen: 'levering' }),
        field('text', 'telefon_levering', 'Telefonnummer', { placeholder: 'Telefon', showWhen: 'levering' }),
        field('email', 'email_levering', 'E-mail', { placeholder: 'email@gmail.com', showWhen: 'levering' }),
      ],
    },
  },
]

async function run() {
  const payload = await getPayload({ config })
  const ids: Record<string, string> = {}

  for (const form of FORMS) {
    const existing = await payload.find({ collection: 'forms', where: { title: { equals: form.title } }, limit: 1, depth: 0 })
    if (existing.docs[0]) {
      ids[form.title] = String(existing.docs[0].id)
      console.log(`- ${form.title}: findes allerede, springes over`)
      continue
    }
    const created = await payload.create({
      collection: 'forms',
      data: {
        title: form.title,
        confirmationType: 'redirect',
        redirect: { type: 'custom', url: THANKS },
        // Mailen går først afsted, når Payload har en e-mail-adapter (SMTP/Resend); indsendelserne gemmes altid.
        emails: [{ emailTo: NOTIFY, subject: `Ny henvendelse: ${form.title}` }],
        ...form.data,
      } as any,
    })
    ids[form.title] = String(created.id)
    console.log(`- ${form.title}: oprettet (${(form.data.fields as any[]).length} felter)`)
  }

  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
  if (!settings.ctaForm) {
    await payload.updateGlobal({ slug: 'siteSettings', data: { ctaForm: ids['Brug for hjælp?'] } as any })
    console.log('- Site Settings: "Brug for hjælp?" valgt som standardformular')
  }

  const page = await payload.find({ collection: 'pages', where: { slug: { equals: 'noegleformular' } }, limit: 1, depth: 0, draft: true })
  if (page.docs[0]) {
    console.log('- noegleformular: siden findes allerede, springes over')
  } else {
    const html = await (await fetch('https://din-laasesmed.dk/noegleformular')).text()
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim()
    const description = html.match(/<meta content="([^"]*)" name="description"/)?.[1]?.trim()
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Nøgleformular',
        slug: 'noegleformular',
        titleTag: title || undefined,
        metaDescription: description || undefined,
        layout: [{ blockType: 'formPage', heading: 'Nøgleformular', form: ids['Nøgleformular'] }],
        _status: 'published',
      } as any,
    })
    console.log(`- noegleformular: side oprettet | titel: ${title}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
