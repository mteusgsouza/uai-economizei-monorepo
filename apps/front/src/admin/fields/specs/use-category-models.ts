'use client'

import { useEffect, useRef, useState } from 'react'

import { fetchTemplates, type TemplateDoc } from './templates-api'

const NO_MODELS: TemplateDoc[] = []

/** Modelos de produto cadastrados para a categoria. */
export function useCategoryModels(categoryId: number | null): TemplateDoc[] {
  const [loaded, setLoaded] = useState<{ categoryId: number; models: TemplateDoc[] } | null>(null)

  useEffect(() => {
    if (categoryId === null) return
    let active = true
    fetchTemplates({ scope: 'model', category: categoryId }).then((models) => {
      if (active) setLoaded({ categoryId, models })
    })
    return () => {
      active = false
    }
  }, [categoryId])

  // Lista de outra categoria não vale: derivar evita limpar o estado no efeito
  return loaded && loaded.categoryId === categoryId ? loaded.models : NO_MODELS
}

/** Modelos que o lojista marcou para sugerir nessa subcategoria. */
export function modelsForSubcategory(models: TemplateDoc[], subcategory: string | null) {
  return subcategory ? models.filter((model) => model.subcategories?.includes(subcategory)) : []
}

/** Roda o efeito só quando o valor muda depois da abertura do documento. */
export function useOnUserChange<T>(value: T, effect: () => void) {
  const previous = useRef<{ value: T } | null>(null)
  useEffect(() => {
    const before = previous.current
    previous.current = { value }
    if (before === null || before.value === value) return
    effect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reage só ao valor
  }, [value])
}
