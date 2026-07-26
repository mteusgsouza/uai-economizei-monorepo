import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoria',
    plural: 'Categorias',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'categorySlug'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    { name: 'categorySlug', type: 'text', required: true, unique: true, label: 'Slug' },
    { name: 'image', type: 'text', label: 'Imagem (URL)' },
    {
      name: 'subcategories',
      type: 'array',
      label: 'Subcategorias',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        { name: 'subcatSlug', type: 'text', required: true, label: 'Slug' },
      ],
    },
  ],
}
