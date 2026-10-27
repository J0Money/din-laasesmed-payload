import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
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
