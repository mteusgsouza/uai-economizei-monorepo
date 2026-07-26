import type { CollectionConfig } from 'payload'

import { HeroBlock, ContentBlock, ProductGridBlock, CTABlock, FAQBlock } from '../blocks/PageBlocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Página',
    plural: 'Páginas',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'template', 'updatedAt'],
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
