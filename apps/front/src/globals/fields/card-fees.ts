import type { Field } from 'payload'

/**
 * A tabela de formas de pagamento da página do produto.
 *
 * Cada linha é o acréscimo da maquininha em N parcelas — o site aplica sobre o
 * preço à vista (`lib/commerce.ts:cardPlans`). Sem nenhuma linha cadastrada a
 * tabela some da página: melhor não mostrar nada do que anunciar uma parcela
 * que a loja não combinou.
 */
export const cardFeesField: Field = {
  name: 'cardFees',
  type: 'group',
  label: 'Formas de pagamento',
  admin: {
    description:
      'A tabela que a página do produto mostra: à vista e o valor da parcela em cada opção de cartão.',
  },
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Ocultar a tabela na página do produto',
      defaultValue: false,
    },
    {
      name: 'cashLabel',
      type: 'text',
      label: 'Como chamar o pagamento à vista',
      defaultValue: 'Dinheiro / Transferência / Pix',
      admin: {
        description: 'A primeira linha da tabela, sem acréscimo.',
        condition: (_, siblingData) => siblingData?.hidden !== true,
      },
    },
    {
      name: 'rates',
      type: 'array',
      label: 'Taxa por parcelamento',
      labels: { singular: 'Parcelamento', plural: 'Parcelamentos' },
      maxRows: 24,
      admin: {
        description:
          'A taxa é acréscimo sobre o preço à vista. Taxa 0% = sem juros.',
        condition: (_, siblingData) => siblingData?.hidden !== true,
        components: { Field: '/src/admin/fields/card-fees/index.tsx#CardFeesTable' },
      },
      defaultValue: [
        { installments: 1, percent: 4.1 },
        { installments: 2, percent: 5 },
        { installments: 3, percent: 5 },
        { installments: 4, percent: 6 },
        { installments: 5, percent: 10 },
        { installments: 6, percent: 10 },
        { installments: 7, percent: 11 },
        { installments: 8, percent: 13 },
        { installments: 9, percent: 17 },
        { installments: 10, percent: 18 },
        { installments: 11, percent: 19 },
        { installments: 12, percent: 20 },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'installments',
              type: 'number',
              label: 'Parcelas',
              required: true,
              min: 1,
              max: 24,
              defaultValue: 1,
            },
            {
              name: 'percent',
              type: 'number',
              label: 'Acréscimo (%)',
              required: true,
              min: 0,
              max: 100,
              defaultValue: 0,
            },
          ],
        },
      ],
    },
  ],
}
