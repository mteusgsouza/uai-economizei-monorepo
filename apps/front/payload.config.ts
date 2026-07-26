import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { ProductEmbedBlock } from './src/blocks/ProductEmbed'
import { Banners } from './src/collections/Banners'
import { Brands } from './src/collections/Brands'
import { Categories } from './src/collections/Categories'
import { CepShipping } from './src/collections/CepShipping'
import { Media } from './src/collections/Media'
import { Pages } from './src/collections/Pages'
import { Posts } from './src/collections/Posts'
import { ProductDescriptions } from './src/collections/ProductDescriptions'
import { Products } from './src/collections/Products'
import { Users } from './src/collections/Users'

export default buildConfig({
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({ blocks: [ProductEmbedBlock] }),
    ],
  }),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false,
  }),

  collections: [Users, Media, Posts, Pages, ProductDescriptions, Products, Brands, Categories, CepShipping, Banners],

  admin: {
    user: Users.slug,
  },

  secret: process.env.PAYLOAD_SECRET || '',

  sharp,
})
