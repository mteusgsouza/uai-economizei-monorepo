import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
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
    { name: 'description', type: 'richText', label: 'Descrição' },
    { name: 'price', type: 'number', required: true, label: 'Preço (centavos)', min: 0 },
    { name: 'paidPrice', type: 'number', label: 'Preço pago (centavos)', min: 0 },
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
    { name: 'productMainImg', type: 'text', label: 'Imagem principal (URL)' },
    {
      name: 'productImages',
      type: 'json',
      label: 'Imagens adicionais',
      admin: { description: 'Array de { name: string, url: string }' },
    },
    { name: 'brand', type: 'relationship', relationTo: 'brands', label: 'Marca' },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Categoria' },
    { name: 'subcategoryId', type: 'number', label: 'ID da Subcategoria (legado)', admin: { position: 'sidebar' } },
  ],
}
