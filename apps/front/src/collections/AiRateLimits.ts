import type { CollectionConfig } from 'payload'

const nobody = () => false

/**
 * Contadores do limite por IP do assistente de busca (`lib/ai/search-assistant/ip-limit.ts`).
 * Só o servidor mexe aqui, por SQL atômico; fica fora do admin e do REST.
 * `key` é um HMAC do IP — o IP em si não é guardado.
 */
export const AiRateLimits: CollectionConfig = {
  slug: 'ai-rate-limits',
  timestamps: false,
  admin: { hidden: true },
  access: { read: nobody, create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
    { name: 'windowStart', type: 'date', required: true },
  ],
}
