import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * Cada registro é um slide do carrossel da home.
 *
 * O `discountLabel` é **só rótulo** ("até 45% off" = o maior desconto da leva).
 * Quem realmente abate preço é o `discountPercent` de cada produto — mexer aqui
 * não muda o que o cliente paga.
 */
export const Promotions: CollectionConfig = {
  slug: 'promotions',
  hooks: {
    afterChange: [revalidateAfterChange('promotions')],
    afterDelete: [revalidateAfterDelete('promotions')],
  },
  labels: {
    singular: 'Promoção',
    plural: 'Promoções',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'discountLabel', 'startDate', 'endDate', 'active'],
    description: 'Os banners do carrossel da home, na ordem definida abaixo.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
      admin: { description: 'A manchete grande do banner. Ex.: "Tecnologia pelo preço que faz sentido".' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Texto de apoio',
      admin: { description: 'Uma linha ou duas abaixo do título.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountLabel',
          type: 'text',
          label: 'Rótulo de desconto',
          admin: { description: 'Ex.: "até 45% off". Só texto — não altera preço.' },
        },
        {
          name: 'note',
          type: 'text',
          label: 'Observação',
          admin: { description: 'Ex.: "até domingo", "estoque limitado".' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', label: 'Texto do botão' },
        {
          name: 'ctaUrl',
          type: 'text',
          label: 'Link do botão',
          admin: { description: 'Ex.: /produtos?categoria=eletronicos' },
        },
      ],
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Produto em destaque',
      admin: { description: 'Dá a imagem e a etiqueta do banner.' },
    },
    {
      name: 'priceLabel',
      type: 'text',
      label: 'Preço exibido',
      admin: { description: 'Ex.: "a partir de R$ 549". Em branco, usa o preço do produto.' },
    },
    {
      name: 'image',
      type: 'text',
      label: 'Imagem (URL)',
      admin: {
        description: 'Opcional — sobrepõe a imagem do produto.',
        components: { Field: '/src/admin/fields/image-url-field.tsx#ImageUrlField' },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Início',
          admin: { description: 'Em branco = já vale.' },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Fim',
          admin: { description: 'Em branco = sem prazo. O período do carrossel sai daqui.' },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordem',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Menor aparece primeiro.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Ativa',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
