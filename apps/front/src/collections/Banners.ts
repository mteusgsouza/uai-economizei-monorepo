import type { CollectionConfig } from 'payload'

export const Banners: CollectionConfig = {
  slug: 'banners',
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
