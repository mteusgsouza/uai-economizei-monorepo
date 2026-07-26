import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuário',
    plural: 'Usuários',
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Account lockout — 5 tentativas erradas = 10 minutos de bloqueio
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutos
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nome' },
  ],
}
