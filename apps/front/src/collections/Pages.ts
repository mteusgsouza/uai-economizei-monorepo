import type { CollectionConfig } from 'payload'

import { slugProblem } from '../../lib/pages/slug-rules'
import { slugify } from '../../lib/slugify'
import { PAGE_BLOCKS } from '../blocks'
import { fillPageDefaults } from './hooks/page-defaults'
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
    beforeValidate: [fillPageDefaults],
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
      label: 'Endereço da página',
      // Valida já normalizado: o hook `fillPageDefaults` limpa o que sobrar da
      // digitação (um hífen no fim) antes de gravar.
      validate: (value: string | null | undefined) => slugProblem(slugify(value ?? '')) ?? true,
      admin: {
        description: 'Vem do título enquanto você digita. Dá para trocar por um nome mais curto.',
        components: { Field: '/src/admin/fields/slug-field.tsx#SlugField' },
      },
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
      blocks: PAGE_BLOCKS,
    },
    {
      // Sem dado próprio: dá nome (`video-1`, `video-2`…) aos blocos na tela
      name: 'blockNamesSync',
      type: 'ui',
      admin: {
        components: { Field: '/src/admin/fields/block-names-sync.tsx#BlockNamesSync' },
      },
    },
  ],
}
