import type { CollectionBeforeChangeHook } from 'payload'

import { parseSpecValues } from '../../../lib/specs/values'

/**
 * Guarda só valores primitivos preenchidos na ficha; ficha vazia vira `null`.
 * Escrita que não traz `specs` (a sincronização da Nest manda só preço e
 * subcategoria) passa intacta.
 */
export const sanitizeSpecs: CollectionBeforeChangeHook = ({ data }) => {
  if (!data || data.specs === undefined) return data
  const values = parseSpecValues(data.specs)
  return { ...data, specs: Object.keys(values).length > 0 ? values : null }
}
