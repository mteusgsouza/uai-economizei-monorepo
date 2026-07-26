import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

const imageField = { Field: '/src/admin/fields/image-url-field.tsx#ImageUrlField' }
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
  // Ordem do formulário: imagem em destaque, identificação, taxonomia, valores,
  // galeria e — por último, por ser o campo mais alto — a descrição.
  fields: [
    {
      name: 'productMainImg',
      type: 'text',
      label: 'Imagem principal (URL)',
      admin: { components: imageField },
    },
    { name: 'name', type: 'text', required: true, label: 'Nome' },
    {
      type: 'row',
      fields: [
        { name: 'brand', type: 'relationship', relationTo: 'brands', label: 'Marca' },
        { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Categoria' },
        {
          name: 'subcategory',
          type: 'text',
          label: 'Subcategoria',
          admin: {
            components: { Field: '/src/admin/fields/subcategory-field.tsx#SubcategoryField' },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
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
      ],
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
          admin: { components: imageField },
        },
      ],
    },
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
    // Status: sempre visível na lateral, fora do fluxo de cadastro
    {
      name: 'active',
      type: 'checkbox',
      label: 'Ativo',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
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
      admin: { position: 'sidebar' },
    },
  ],
}
