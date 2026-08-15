import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '../collections/hooks/revalidate'

/**
 * Regras comerciais da loja inteira — o que não pertence a um produto só.
 *
 * Estes valores mudam o que o cliente paga: o site mostra e a Nest cobra a
 * partir daqui (`apps/api/src/common/pricing.ts` lê este global pelo REST).
 * Mexer aqui é mexer no caixa.
 */
export const StoreSettings: GlobalConfig = {
  slug: 'store-settings',
  label: 'Configurações da loja',
  hooks: {
    afterChange: [revalidateGlobalAfterChange('store-settings')],
  },
  access: {
    read: () => true,
  },
  admin: {
    group: 'Configurações',
  },
  fields: [
    {
      name: 'freeShipping',
      type: 'group',
      label: 'Frete grátis',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Oferecer frete grátis acima de um valor',
          defaultValue: false,
        },
        {
          name: 'minValue',
          type: 'number',
          label: 'Valor mínimo do pedido (centavos)',
          min: 0,
          defaultValue: 19900,
          admin: {
            description: 'Ex.: 19900 = R$ 199,00. O carrinho mostra quanto falta para chegar lá.',
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pixDiscountPercent',
          type: 'number',
          label: 'Desconto no PIX (%)',
          min: 0,
          max: 100,
          defaultValue: 10,
          admin: {
            description: 'Vale para os produtos marcados com "Desconto no PIX".',
          },
        },
        {
          name: 'maxInstallments',
          type: 'number',
          label: 'Parcelas sem juros',
          min: 1,
          max: 24,
          defaultValue: 12,
        },
      ],
    },
    {
      name: 'campaign',
      type: 'group',
      label: 'Campanha em cartaz',
      admin: {
        description:
          'Assina o topo da vitrine da home. O período ao lado é calculado das datas das promoções ativas.',
      },
      fields: [{ name: 'name', type: 'text', label: 'Nome' }],
    },
  ],
}
