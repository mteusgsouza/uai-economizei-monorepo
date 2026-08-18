import type { Field } from 'payload'

/** Os ícones oferecidos à loja. O desenho vive em `components/layout/benefits-band.tsx`. */
const ICON_OPTIONS = [
  { label: 'Caminhão (entrega)', value: 'truck' },
  { label: 'Cartão (pagamento)', value: 'creditCard' },
  { label: 'Escudo (segurança)', value: 'shield' },
  { label: 'Setas (troca e devolução)', value: 'refresh' },
  { label: 'Headset (atendimento)', value: 'headset' },
  { label: 'Etiqueta (preço)', value: 'tag' },
  { label: 'Relógio (prazo)', value: 'clock' },
  { label: 'Presente (brinde)', value: 'gift' },
]

/** Só o texto digitado à mão precisa de título e descrição. */
const isManual: NonNullable<NonNullable<Field['admin']>['condition']> = (_, siblingData) =>
  !siblingData?.source || siblingData.source === 'manual'

/**
 * A faixa escura que fecha a home (`BenefitsBand`). As fontes calculadas se
 * escrevem a partir das regras de frete, parcelas e PIX deste mesmo global.
 */
export const benefitsField: Field = {
  name: 'benefits',
  type: 'group',
  label: 'Faixa de vantagens',
  admin: {
    description:
      'A faixa escura que fecha a home. Sem nenhuma linha, ela volta ao padrão (frete, parcelas, troca e compra segura).',
  },
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Ocultar a faixa',
      defaultValue: false,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Vantagens',
      labels: { singular: 'Vantagem', plural: 'Vantagens' },
      maxRows: 4,
      admin: {
        description: 'A faixa tem quatro colunas — mais que isso não cabe.',
        condition: (_, siblingData) => siblingData?.hidden !== true,
      },
      defaultValue: [
        { source: 'freeShipping', icon: 'truck' },
        { source: 'installments', icon: 'creditCard' },
        {
          source: 'manual',
          icon: 'refresh',
          title: '30 dias',
          note: 'Troca ou devolução sem custo',
        },
        {
          source: 'manual',
          icon: 'headset',
          title: 'Atendimento no WhatsApp',
          note: 'Fale direto com a loja',
        },
      ],
      // Duas linhas: o que a vantagem é (fonte e ícone) e o que ela diz. A
      // segunda some inteira nas fontes calculadas, que escrevem o próprio texto.
      // `row` é só disposição — não muda o schema.
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'source',
              type: 'select',
              label: 'De onde vem o texto',
              required: true,
              defaultValue: 'manual',
              options: [
                { label: 'Digitado aqui', value: 'manual' },
                { label: 'Frete grátis (usa a regra acima)', value: 'freeShipping' },
                { label: 'Parcelas e PIX (usam as regras acima)', value: 'installments' },
              ],
              admin: {
                description:
                  'As opções calculadas se escrevem sozinhas — e a do frete some quando o frete grátis está desligado.',
              },
            },
            {
              name: 'icon',
              type: 'select',
              label: 'Ícone',
              required: true,
              defaultValue: 'shield',
              options: ICON_OPTIONS,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Título',
              admin: { description: 'Ex.: Atendimento no WhatsApp.', condition: isManual },
            },
            {
              name: 'note',
              type: 'text',
              label: 'Descrição',
              admin: {
                description: 'A linha menor embaixo do título. Pode ficar vazia.',
                condition: isManual,
              },
            },
          ],
        },
      ],
    },
  ],
}
