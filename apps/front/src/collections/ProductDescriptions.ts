import type { CollectionConfig } from 'payload'

export const ProductDescriptions: CollectionConfig = {
  slug: 'product-descriptions',
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
