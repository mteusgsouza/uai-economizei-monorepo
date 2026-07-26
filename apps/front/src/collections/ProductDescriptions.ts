import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

export const ProductDescriptions: CollectionConfig = {
  slug: 'product-descriptions',
  hooks: {
    afterChange: [revalidateAfterChange('products')],
    afterDelete: [revalidateAfterDelete('products')],
  },
  labels: {
    singular: 'Descrição de Produto',
    plural: 'Descrições de Produtos',
  },
  admin: {
    useAsTitle: 'productId',
    defaultColumns: ['productId', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'productId',
      type: 'text',
      required: true,
      unique: true,
      label: 'ID do Produto',
      admin: {
        description: 'Referência ao produto no catálogo NestJS (ex: slug ou ID numérico)',
      },
    },
    { name: 'description', type: 'richText', label: 'Descrição' },
    { name: 'features', type: 'richText', label: 'Características' },
    {
      name: 'specs',
      type: 'json',
      label: 'Especificações técnicas',
      admin: {
        description: 'JSON estruturado com especificações (ex: {"peso": "200g", "dimensoes": "10x20x5cm"})',
      },
    },
  ],
}
