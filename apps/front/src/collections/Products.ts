import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

const imagePreview = { afterInput: ['/src/admin/fields/image-preview.tsx#ImagePreview'] }
const priceHint = { afterInput: ['/src/admin/fields/price-hint.tsx#PriceHint'] }

export const Products: CollectionConfig = {
  slug: 'products',
  hooks: {
    afterChange: [revalidateAfterChange('products')],
    afterDelete: [revalidateAfterDelete('products')],
  },
  labels: {
    singular: 'Produto',
    plural: 'Produtos',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'stock', 'brand', 'category', 'active'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nome' },
    {
      name: 'description',
      type: 'code',
      label: 'Descrição',
      admin: {
        language: 'html',
        description:
          'Use a aba Visual para escrever e formatar, ou a aba HTML para colar código pronto.',
        components: { Field: '/src/admin/fields/html-editor/index.tsx#HtmlEditorField' },
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Preço (centavos)',
      min: 0,
      admin: { components: priceHint },
    },
    {
      name: 'paidPrice',
      type: 'number',
      label: 'Preço pago (centavos)',
      min: 0,
      admin: { components: priceHint },
    },
    { name: 'stock', type: 'number', label: 'Estoque', min: 0, defaultValue: 0 },
    { name: 'active', type: 'checkbox', label: 'Ativo', defaultValue: true },
    {
      name: 'isNew',
      type: 'select',
      label: 'Novidade',
      options: [
        { label: 'Não', value: 'false' },
        { label: 'Sim', value: 'true' },
        { label: 'Lançamento', value: 'lancamento' },
        { label: 'Novidade', value: 'novidade' },
      ],
      defaultValue: 'false',
    },
    {
      name: 'productMainImg',
      type: 'text',
      label: 'Imagem principal (URL)',
      admin: { components: imagePreview },
    },
    {
      name: 'productImages',
      type: 'array',
      label: 'Imagens adicionais',
      labels: { singular: 'Imagem', plural: 'Imagens' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', type: 'text', label: 'Nome' },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
          admin: { components: imagePreview },
        },
      ],
    },
    { name: 'brand', type: 'relationship', relationTo: 'brands', label: 'Marca' },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Categoria' },
    {
      name: 'subcategoryId',
      type: 'number',
      label: 'ID da Subcategoria (legado)',
      admin: { position: 'sidebar' },
    },
  ],
}
