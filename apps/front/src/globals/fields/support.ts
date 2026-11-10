import type { Field } from 'payload'

/**
 * Canais de atendimento que o chatbot de ajuda do site mostra ao cliente.
 *
 * Tudo opcional: o chatbot só exibe o canal que estiver preenchido.
 */
export const supportField: Field = {
  name: 'support',
  type: 'group',
  label: 'Canais de atendimento',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'whatsapp',
          type: 'text',
          label: 'WhatsApp',
          admin: {
            description:
              'Só números, com DDD e país. Ex.: 5531999999999 (vira link wa.me/<valor>).',
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Telefone',
          admin: { description: 'Pode ter máscara. Ex.: (31) 3333-4444.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'text', label: 'E-mail' },
        {
          name: 'hours',
          type: 'text',
          label: 'Horário de atendimento',
          admin: { description: 'Ex.: Seg a sex, 9h às 18h.' },
        },
      ],
    },
  ],
}
