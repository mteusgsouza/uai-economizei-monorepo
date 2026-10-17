import type { CollectionConfig } from 'payload'

import { withSpecKeys } from '../../lib/specs/keys'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

const isModel = (data: { scope?: string | null } | undefined) => data?.scope !== 'category'

/**
 * Define quais campos a ficha técnica de um tipo de produto tem. O lojista cria
 * o modelo aqui e o cadastro do produto passa a mostrar esses campos — tipo
 * novo de produto não precisa de código nem de migration.
 */
export const SpecTemplates: CollectionConfig = {
  slug: 'spec-templates',
  labels: {
    singular: 'Modelo de ficha técnica',
    plural: 'Modelos de ficha técnica',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'scope', 'category', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => (data?.fields ? { ...data, fields: withSpecKeys(data.fields) } : data),
    ],
    // A página do produto mostra nome e unidade vindos daqui
    afterChange: [revalidateAfterChange('products')],
    afterDelete: [revalidateAfterDelete('products')],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nome', admin: { placeholder: 'Notebook' } },
        {
          name: 'scope',
          type: 'select',
          required: true,
          label: 'Tipo',
          defaultValue: 'model',
          options: [
            { label: 'Modelo de produto', value: 'model' },
            { label: 'Campos comuns da categoria', value: 'category' },
          ],
          admin: {
            description:
              'Campos comuns aparecem em todo produto da categoria, junto do modelo escolhido.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'relationship', relationTo: 'categories', required: true, label: 'Categoria' },
        {
          name: 'subcategories',
          type: 'text',
          hasMany: true,
          label: 'Sugerir nas subcategorias',
          admin: {
            condition: isModel,
            description: 'O cadastro do produto sugere este modelo para essas subcategorias.',
            components: { Field: '/src/admin/fields/subcategory-field.tsx#SubcategoryField' },
          },
        },
      ],
    },
    {
      name: 'fields',
      type: 'array',
      label: 'Campos',
      labels: { singular: 'Campo', plural: 'Campos' },
      minRows: 1,
      admin: {
        components: { RowLabel: '/src/admin/fields/specs/spec-row-label.tsx#SpecRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Nome do campo', admin: { placeholder: 'Memória RAM' } },
            {
              name: 'type',
              type: 'select',
              required: true,
              label: 'Tipo',
              defaultValue: 'number',
              options: [
                { label: 'Número', value: 'number' },
                { label: 'Texto', value: 'text' },
                { label: 'Sim/Não', value: 'boolean' },
                { label: 'Lista de opções', value: 'select' },
              ],
            },
            {
              name: 'unit',
              type: 'text',
              label: 'Unidade',
              admin: { condition: (_, row) => row?.type === 'number', placeholder: 'GB, W, L, peças' },
            },
          ],
        },
        {
          name: 'options',
          type: 'text',
          hasMany: true,
          label: 'Opções',
          admin: {
            condition: (_, row) => row?.type === 'select',
            description: 'Digite cada opção e tecle Enter (ex.: 127V, 220V, Bivolt).',
          },
        },
        {
          name: 'group',
          type: 'text',
          label: 'Grupo',
          admin: { description: 'Agrupa na página do produto (ex.: Desempenho, Tela). Opcional.' },
        },
        // Gerada do nome na primeira vez e nunca mais alterada (ver withSpecKeys)
        { name: 'key', type: 'text', admin: { hidden: true } },
      ],
    },
  ],
}
