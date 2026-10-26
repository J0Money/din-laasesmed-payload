import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

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
import { Home } from './globals/Home'
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
  collections: [Pages, Articles, Categories, Brands, Employees, Jobs, Users, Media, Videos],
  globals: [Header, Footer, SiteSettings, Home],
  plugins: [
    // Formularer sættes sammen i admin (felter, e-mail til os, bekræftelse); indsendelser gemmes i form-submissions.
    formBuilderPlugin({
      fields: { payment: false, state: false, country: false },
      redirectRelationships: ['pages'],
      formOverrides: {
        labels: { singular: 'Formular', plural: 'Formularer' },
        admin: { group: 'Formularer' },
      },
      formSubmissionOverrides: {
        labels: { singular: 'Indsendelse', plural: 'Indsendelser' },
        admin: { group: 'Formularer' },
      },
    }),
  ],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: [videoEmbedBlock] })],
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
