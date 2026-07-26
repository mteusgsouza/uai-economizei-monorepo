import type { CollectionConfig } from 'payload'

export const CepShipping: CollectionConfig = {
  slug: 'cep-shipping',
  labels: {
    singular: 'Região de Frete',
    plural: 'Regiões de Frete',
  },
  admin: {
    useAsTitle: 'descricao',
    defaultColumns: ['cepInicial', 'cepFinal', 'descricao', 'valor'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'cepInicial', type: 'number', required: true, label: 'CEP Inicial' },
    { name: 'cepFinal', type: 'number', required: true, label: 'CEP Final' },
    { name: 'descricao', type: 'text', required: true, label: 'Descrição' },
    { name: 'valor', type: 'number', required: true, label: 'Valor (centavos)', min: 0 },
  ],
}
