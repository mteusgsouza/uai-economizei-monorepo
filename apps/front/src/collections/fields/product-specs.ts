import type { Field, FilterOptions, Tab, Where } from 'payload'

import { relationId } from '../../../lib/relation-id'

/**
 * Só modelos de produto da mesma categoria. Vale também na validação ao
 * salvar: trocar a categoria exige trocar o modelo (o campo da ficha limpa o
 * modelo sozinho quando a categoria muda).
 */
const sameCategoryModels: FilterOptions = ({ data }) => {
  const where: Where = { scope: { equals: 'model' } }
  const categoryId = relationId(data?.category)
  if (categoryId !== null) where.category = { equals: categoryId }
  return where
}

/**
 * Vai na aba onde ficam categoria e subcategoria: troca o modelo da ficha
 * quando elas mudam. Campo `ui` não tem coluna — não gera migration.
 */
export const specTemplateSyncField: Field = {
  name: 'specTemplateSync',
  type: 'ui',
  admin: {
    components: { Field: '/src/admin/fields/specs/template-sync.tsx#SpecTemplateSync' },
  },
}

/** Aba "Ficha técnica" do produto. Os campos vêm do modelo, não do código. */
export const productSpecsTab: Tab = {
  label: 'Ficha técnica',
  fields: [
    {
      name: 'specTemplate',
      type: 'relationship',
      relationTo: 'spec-templates',
      label: 'Modelo da ficha técnica',
      filterOptions: sameCategoryModels,
      admin: {
        description: 'Define quais campos a ficha tem. Os campos comuns da categoria entram sozinhos.',
      },
    },
    {
      name: 'specs',
      type: 'json',
      label: 'Campos da ficha',
      admin: {
        components: { Field: '/src/admin/fields/specs/index.tsx#SpecsField' },
      },
    },
  ],
}
