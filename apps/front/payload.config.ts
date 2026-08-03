import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
    components: {
      views: {
        dashboard: {
          Component: '/src/admin/views/dashboard/index.tsx#DashboardView',
        },
        ordersView: {
          Component: '/src/admin/views/orders/index.tsx#OrdersView',
          path: '/pedidos',
        },
        customersView: {
          Component: '/src/admin/views/customers/index.tsx#CustomersView',
          path: '/clientes',
        },
      },
      afterNavLinks: ['/src/admin/components/nav-links.tsx#AdminNavLinks'],
    },
  },

  secret: process.env.PAYLOAD_SECRET || '',

  // Em produção (Vercel) o filesystem é efêmero: os uploads precisam ir para o
  // Blob. Sem o token o plugin fica desligado e a Media volta para o
  // `staticDir` local, mantendo o fluxo de desenvolvimento funcionando.
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { [Media.slug]: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  sharp,
})
