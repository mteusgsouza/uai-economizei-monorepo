import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  hooks: {
    afterChange: [revalidateAfterChange('categories')],
    afterDelete: [revalidateAfterDelete('categories')],
  },
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
