'use client'

import { useField } from '@payloadcms/ui'

import { relationId } from '../../../../lib/relation-id'
import { modelsForSubcategory, useCategoryModels, useOnUserChange } from './use-category-models'
import { useProductTaxonomy } from './use-product-taxonomy'

/**
 * Campo invisível na aba Conteúdo, onde ficam categoria e subcategoria. O
 * Payload só monta os campos da aba ativa, então a aba Ficha técnica não vê
 * essas trocas — a sincronização precisa morar aqui:
 * - categoria mudou: limpa o modelo (o de antes não passa no filtro e
 *   travaria o salvamento);
 * - subcategoria mudou e só um modelo serve: escolhe esse modelo.
 *
 * Nada acontece na abertura do documento — o formulário não pode nascer
 * marcado como modificado.
 */
export function SpecTemplateSync() {
  const template = useField<number | string | null>({ path: 'specTemplate' })
  const { categoryId, subcategory } = useProductTaxonomy()
  const models = useCategoryModels(categoryId)

  useOnUserChange(categoryId, () => template.setValue(null))
  useOnUserChange(subcategory, () => {
    const [only, ...others] = modelsForSubcategory(models, subcategory)
    if (relationId(template.value) === null && only && others.length === 0) {
      template.setValue(only.id)
    }
  })

  return null
}

export default SpecTemplateSync
