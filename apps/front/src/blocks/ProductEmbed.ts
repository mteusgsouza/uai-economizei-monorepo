import type { Block } from 'payload'

export const ProductEmbedBlock: Block = {
  slug: 'product-embed',
  labels: {
    singular: 'Produto',
    plural: 'Produtos',
  },
  fields: [
    {
      name: 'productId',
      type: 'text',
      required: true,
      label: 'ID do Produto',
      admin: {
        description: 'ID do produto no catálogo (referência externa ao NestJS)',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'Inline', value: 'inline' },
        { label: 'Banner', value: 'banner' },
      ],
      defaultValue: 'card',
    },
  ],
}
