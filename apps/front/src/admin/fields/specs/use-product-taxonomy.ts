'use client'

import { useFormFields } from '@payloadcms/ui'

import { relationId } from '../../../../lib/relation-id'

/** Categoria e subcategoria do produto, lidas do form state. */
export function useProductTaxonomy() {
  const categoryId = relationId(useFormFields(([fields]) => fields?.category?.value))
  const subcategoryValue = useFormFields(([fields]) => fields?.subcategory?.value)
  const subcategory = typeof subcategoryValue === 'string' ? subcategoryValue : null
  return { categoryId, subcategory }
}
