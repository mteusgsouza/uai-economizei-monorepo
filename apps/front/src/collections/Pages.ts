import type { CollectionConfig } from 'payload'

import { HeroBlock, ContentBlock, ProductGridBlock, CTABlock, FAQBlock } from '../blocks/PageBlocks'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Página',
    plural: 'Páginas',
  },
  // Página nova ou editada entra no ar sem deploy: `/[slug]` lê pela tag `pages`
  // (ver `lib/catalog/pages.ts`). O sitemap não passa pela tag — ver
  // `src/endpoints/sitemap.ts`.
  hooks: {
    afterChange: [revalidateAfterChange('pages')],
    afterDelete: [revalidateAfterDelete('pages')],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'template', 'updatedAt'],
    components: {
      edit: {
        beforeDocumentControls: ['/src/admin/components/store-link.tsx#PageStoreLink'],
      },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
    },
    {
      name: 'template',
      type: 'select',
      label: 'Template',
      options: [
        { label: 'Padrão', value: 'default' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Contato', value: 'contact' },
      ],
      defaultValue: 'default',
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout da página',
      blocks: [HeroBlock, ContentBlock, ProductGridBlock, CTABlock, FAQBlock],
    },
  ],
}
