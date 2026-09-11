import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { splitTerms } from '../../lib/search/synonyms'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

const validateTerms: TextFieldSingleValidation = (value) =>
  splitTerms(value ?? '').length >= 2 ||
  'Informe pelo menos dois termos diferentes, separados por vírgula.'

/**
 * Grupos de termos que a busca do site trata como equivalentes. Vale para o
 * catálogo inteiro na hora da busca — produto cadastrado depois já é achado
 * pelos sinônimos existentes, sem reindexar nada.
 */
export const SearchSynonyms: CollectionConfig = {
  slug: 'search-synonyms',
  hooks: {
    afterChange: [revalidateAfterChange('search-synonyms')],
    afterDelete: [revalidateAfterDelete('search-synonyms')],
  },
  labels: {
    singular: 'Sinônimo de busca',
    plural: 'Sinônimos de busca',
  },
  admin: {
    useAsTitle: 'terms',
    defaultColumns: ['terms', 'updatedAt'],
    description:
      'Termos que a busca do site trata como iguais: quem procura um deles vê os produtos de todos.',
  },
  fields: [
    {
      name: 'terms',
      type: 'text',
      required: true,
      label: 'Termos equivalentes',
      validate: validateTerms,
      admin: {
        description: 'Separe por vírgula. Ex.: fone de ouvido, headset, headphone',
      },
    },
  ],
}
