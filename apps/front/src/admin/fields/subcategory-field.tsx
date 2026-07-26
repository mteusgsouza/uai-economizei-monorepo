'use client'

import { useEffect, useRef, useState } from 'react'
import { FieldLabel, SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

interface SubcategoryOption {
  label: string
  value: string
}

/** Lê as subcategorias da categoria escolhida direto da REST do Payload. */
async function fetchSubcategories(categoryId: string): Promise<SubcategoryOption[]> {
  const res = await fetch(`/api/categories/${categoryId}?depth=0`)
  if (!res.ok) return []

  const doc = (await res.json()) as {
    subcategories?: Array<{ title?: string; subcatSlug?: string }> | null
  }

  return (doc.subcategories ?? [])
    .filter((sub): sub is { title: string; subcatSlug: string } =>
      Boolean(sub.title && sub.subcatSlug),
    )
    .map((sub) => ({ label: sub.title, value: sub.subcatSlug }))
}

/**
 * Seleciona a subcategoria dentro da categoria escolhida.
 *
 * As subcategorias são um array dentro de Categories, não uma collection — por
 * isso não dá para usar `relationship` e as opções são carregadas sob demanda.
 * Guarda o slug: é estável mesmo que as subcategorias sejam reordenadas.
 */
export const SubcategoryField: TextFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, path, showError, disabled } = useField<string>()
  const [options, setOptions] = useState<SubcategoryOption[]>([])
  const [loading, setLoading] = useState(false)

  const categoryValue = useFormFields(([fields]) => fields?.category?.value)
  const categoryId =
    typeof categoryValue === 'string' || typeof categoryValue === 'number'
      ? String(categoryValue)
      : ''

  const locked = Boolean(readOnly) || Boolean(disabled)

  useEffect(() => {
    if (!categoryId) {
      setOptions([])
      return
    }

    let active = true
    setLoading(true)

    fetchSubcategories(categoryId)
      .then((list) => {
        if (active) setOptions(list)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [categoryId])

  // Limpa a seleção só quando o usuário troca a categoria — nunca na abertura
  // do documento, senão o formulário já nasceria marcado como modificado.
  const previousCategoryRef = useRef<string | null>(null)
  useEffect(() => {
    const previous = previousCategoryRef.current
    previousCategoryRef.current = categoryId

    if (previous === null || previous === categoryId) return
    setValue(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- não reagir a setValue
  }, [categoryId])

  const placeholder = !categoryId
    ? 'Escolha uma categoria primeiro'
    : loading
      ? 'Carregando…'
      : options.length === 0
        ? 'Categoria sem subcategorias'
        : 'Selecione'

  return (
    <div className="uai-subcategory-field field-type">
      <FieldLabel label={field?.label} path={path} />
      <SelectInput
        name={field?.name ?? 'subcategory'}
        path={path}
        options={options}
        value={value ?? undefined}
        showError={showError}
        isClearable
        readOnly={locked || !categoryId || loading || options.length === 0}
        placeholder={placeholder}
        onChange={(option) => {
          const next = Array.isArray(option) ? option[0] : option
          setValue(next?.value ?? null)
        }}
      />
    </div>
  )
}

export default SubcategoryField
