import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

export const Banners: CollectionConfig = {
  slug: 'banners',
  hooks: {
    afterChange: [revalidateAfterChange('banners')],
    afterDelete: [revalidateAfterDelete('banners')],
  },
  labels: {
    singular: 'Banner',
    plural: 'Banners',
  },
  admin: {
    useAsTitle: 'url',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'bannerImg', type: 'text', label: 'URL da imagem do banner' },
    { name: 'url', type: 'text', label: 'URL de destino' },
  ],
}
