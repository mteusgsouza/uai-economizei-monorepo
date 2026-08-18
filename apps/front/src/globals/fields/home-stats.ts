import type { Field } from 'payload'

/**
 * A régua de números logo abaixo da vitrine da home.
 *
 * As opções calculadas (`maxDiscount`, `installments`, `pixDiscount`) são
 * resolvidas no storefront por `lib/storefront-content.ts` — o admin só guarda
 * de onde o número vem.
 */
export const homeStatsField: Field = {
  name: 'homeStats',
  type: 'group',
  label: 'Régua de destaques da home',
  admin: {
    description:
      'A faixa de números logo abaixo da vitrine. Sem nenhuma linha, ela volta ao padrão (desconto, parcelas e entrega).',
  },
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Ocultar a régua na home',
      defaultValue: false,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Destaques',
      labels: { singular: 'Destaque', plural: 'Destaques' },
      maxRows: 4,
      admin: {
        description:
          'As opções calculadas somem da faixa quando o valor é zero — nada de "0% desconto máx." na home.',
        condition: (_, siblingData) => siblingData?.hidden !== true,
      },
      defaultValue: [
        { source: 'maxDiscount', label: 'desconto máx.' },
        { source: 'installments', label: 'no cartão' },
        { source: 'manual', value: '48h', label: 'entrega expressa' },
      ],
      // `row` é só disposição — não aninha nada no schema. Cada destaque cabe
      // numa linha, o que deixa a lista varrível: são até quatro, e empilhados
      // em três campos cada viram doze caixas soltas.
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'source',
              type: 'select',
              label: 'De onde vem o número',
              required: true,
              defaultValue: 'manual',
              options: [
                { label: 'Digitado aqui', value: 'manual' },
                { label: 'Maior desconto do catálogo (%)', value: 'maxDiscount' },
                { label: 'Parcelas no cartão (x)', value: 'installments' },
                { label: 'Desconto no PIX (%)', value: 'pixDiscount' },
              ],
            },
            {
              name: 'value',
              type: 'text',
              label: 'Número',
              admin: {
                description: 'Ex.: 48h, 30 dias, 4.9★.',
                condition: (_, siblingData) =>
                  !siblingData?.source || siblingData.source === 'manual',
              },
            },
            { name: 'label', type: 'text', label: 'Legenda', required: true },
          ],
        },
      ],
    },
  ],
}
