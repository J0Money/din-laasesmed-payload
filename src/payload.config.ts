import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { s3Storage } from '@payloadcms/storage-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { Agent as HttpsAgent } from 'https'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { htmlEmbedBlock } from './blocks/richtext/HtmlEmbed'
import { videoEmbedBlock } from './blocks/richtext/VideoEmbed'
import { Articles } from './collections/Articles'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Employees } from './collections/Employees'
import { Jobs } from './collections/Jobs'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { extendFormFields } from './lib/formBuilder'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // E-mail fra formularerne sendes over SMTP, når SMTP_HOST er sat (se .env.example). Ellers skrives de kun til konsollen.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@din-laasesmed.dk',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Din Låsesmed',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        },
      })
    : undefined,
  collections: [Pages, Articles, Categories, Brands, Employees, Jobs, Users, Media, Videos],
  globals: [Header, Footer, SiteSettings],
  folders: false,
  plugins: [
    // Billeder gemmes i en S3-kompatibel bucket (Railway Bucket), når S3_ENABLED=true (se .env.example). Ellers bruges mappen media.
    // Filerne sendes stadig gennem Payload, så billed-URL'erne er de samme som før, og bucketen kan være privat.
    // S3_ENABLED sættes først, når eksisterende billeder er uploadet (scripts/upload-media-to-bucket.mjs).
    ...(process.env.S3_ENABLED === 'true' && process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'auto',
              // Nye Railway-buckets bruger virtual-hosted-style, ældre path-style (står på bucketens Credentials-fane).
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
              // Bucketen lukker ventende forbindelser, så genbrugte forbindelser gav ECONNRESET og 502 på billeder. Ny forbindelse pr. kald.
              requestHandler: new NodeHttpHandler({ httpsAgent: new HttpsAgent({ keepAlive: false }) }),
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
          }),
        ]
      : []),
    // MCP-adgang til indholdet (så fx Claude kan læse, oprette og rette). Kun de tre indholdstyper nedenfor er med:
    // formularindsendelser og brugere (persondata) er bevidst udeladt, og intet kan slettes. Nøgler oprettes i admin
    // under "MCP > API-nøgler", hvor man pr. nøgle kan slå rettighederne fra.
    mcpPlugin({
      userCollection: 'users',
      collections: {
        articles: {
          description: 'Artikler på din-laasesmed.dk (viden, lokationssider som "Låsesmed Hammel" og nyheder).',
          enabled: { find: true, create: true, update: true, delete: false },
        },
        brands: {
          description: 'Mærker Din Låsesmed forhandler (logo, tekst og SEO).',
          enabled: { find: true, create: true, update: true, delete: false },
        },
        categories: {
          description: 'Kategorier i oversigterne (Mekanisk sikring, Elektronisk sikring, Service, Nyheder).',
          enabled: { find: true, create: true, update: true, delete: false },
        },
      },
      mcp: {
        serverOptions: {
          serverInfo: { name: 'Din Låsesmed CMS', version: '1.0.0' },
          instructions:
            'Du redigerer indholdet på din-laasesmed.dk, en dansk låsesmed i Aarhus. Skriv på dansk i samme tone som de eksisterende artikler. ' +
            'Opfind aldrig priser, telefonnumre, adresser, certificeringer eller tal. Brug kun oplysninger, brugeren har givet, eller som allerede står på siden. ' +
            'Slug skal være små bogstaver uden æ, ø, å og med bindestreger (fx lasesmed-hammel). Hent en lignende artikel først og følg dens opbygning. ' +
            'Ændringer udgives med det samme, så spørg før du overskriver en eksisterende tekst.',
        },
      },
    }),
    // Formularer sættes sammen i admin (felter, e-mail til os, bekræftelse); indsendelser gemmes i form-submissions.
    formBuilderPlugin({
      fields: { payment: false, state: false, country: false },
      redirectRelationships: ['pages'],
      formOverrides: {
        labels: { singular: 'Formular', plural: 'Formularer' },
        admin: { group: 'Formularer' },
        fields: extendFormFields,
      },
      formSubmissionOverrides: {
        labels: { singular: 'Indsendelse', plural: 'Indsendelser' },
        admin: { group: 'Formularer' },
      },
    }),
  ],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: [videoEmbedBlock, htmlEmbedBlock] })],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
})
