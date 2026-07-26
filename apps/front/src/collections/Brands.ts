import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

export const Brands: CollectionConfig = {
  slug: 'brands',
  hooks: {
    afterChange: [revalidateAfterChange('brands')],
    afterDelete: [revalidateAfterDelete('brands')],
  },
  labels: {
    singular: 'Marca',
    plural: 'Marcas',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, label: 'Nome' },
  ],
}
