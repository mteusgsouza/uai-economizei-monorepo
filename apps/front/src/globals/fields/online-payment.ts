import type { Field } from 'payload'

/**
 * O interruptor do pagamento pelo site.
 *
 * Desligado, o pedido vira **orçamento**: o checkout para de pedir forma de
 * pagamento e a Nest grava o pedido sem nenhuma linha de `Payment` — o acerto
 * acontece fora do site e o admin move o status depois.
 *
 * Não mexe nos preços da vitrine. Desconto no PIX e parcelas seguem anunciados
 * como informação comercial, porque a loja continua negociando essas condições
 * — só que por fora. Para escondê-los existe o `cardFees.hidden`.
 */
export const onlinePaymentField: Field = {
  name: 'onlinePayment',
  type: 'group',
  label: 'Pagamento pelo site',
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Receber o pagamento pelo site',
      defaultValue: true,
      admin: {
        description:
          'Desligado, o pedido vira um orçamento: o cliente fecha sem informar forma de pagamento e o acerto acontece fora do site.',
      },
    },
    {
      name: 'offlineNotice',
      type: 'text',
      label: 'O que o cliente lê no fechamento',
      defaultValue:
        'O pagamento é combinado direto com a loja após a confirmação do pedido.',
      admin: {
        description: 'Aparece no lugar das formas de pagamento, no último passo.',
        condition: (_, siblingData) => siblingData?.enabled === false,
      },
    },
  ],
}
