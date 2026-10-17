import type { CollectionBeforeValidateHook } from 'payload'

import { withBlockNames, type NamedBlock } from '../../../lib/pages/block-names'
import { slugify } from '../../../lib/slugify'
import { blockNameBase } from '../../blocks'

function isNamedBlock(value: unknown): value is NamedBlock {
  return typeof value === 'object' && value !== null && 'blockType' in value
}

/**
 * O mesmo que o admin faz na tela, garantido no servidor (vale também para a
 * REST): endereço normalizado e blocos com nome. O endereço só nasce do
 * título na criação — trocar o título de uma página no ar não pode mudar o
 * link dela por baixo dos panos.
 */
export const fillPageDefaults: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return data

  const typedSlug = typeof data.slug === 'string' ? slugify(data.slug) : ''
  if (typedSlug) data.slug = typedSlug
  else if (operation === 'create' && typeof data.title === 'string') data.slug = slugify(data.title)

  if (Array.isArray(data.layout) && data.layout.every(isNamedBlock)) {
    data.layout = withBlockNames(data.layout, blockNameBase)
  }
  return data
}
