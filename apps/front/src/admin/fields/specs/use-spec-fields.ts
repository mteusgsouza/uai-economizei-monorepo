'use client'

import { useEffect, useState } from 'react'

import type { SpecFieldDef } from '../../../../lib/specs/types'
import { mergeSpecFields, toSpecFieldDefs } from '../../../../lib/specs/values'
import { fetchTemplate, fetchTemplates } from './templates-api'

interface SpecFields {
  fields: SpecFieldDef[]
  /** Chaves que vêm dos campos comuns da categoria, não do modelo. */
  commonKeys: Set<string>
}

const NONE: SpecFields = { fields: [], commonKeys: new Set() }

async function loadSpecFields(templateId: number | null, categoryId: number | null) {
  const [model, common] = await Promise.all([
    templateId === null ? null : fetchTemplate(templateId),
    categoryId === null ? [] : fetchTemplates({ scope: 'category', category: categoryId }),
  ])
  const modelFields = toSpecFieldDefs(model?.fields)
  const fields = mergeSpecFields(
    modelFields,
    common.flatMap((template) => toSpecFieldDefs(template.fields)),
  )
  const modelKeys = new Set(modelFields.map((field) => field.key))
  const commonKeys = new Set(fields.map((f) => f.key).filter((key) => !modelKeys.has(key)))
  return { fields, commonKeys }
}

/**
 * Campos da ficha do produto: os do modelo escolhido + os comuns da categoria.
 * O resultado guarda a chave da busca que o gerou; enquanto ela não bate com
 * a atual, está carregando — sem isso, no primeiro quadro, todo valor
 * guardado apareceria como "fora do modelo".
 */
export function useSpecFields(templateId: number | null, categoryId: number | null) {
  const key = `${templateId ?? ''}:${categoryId ?? ''}`
  const idle = templateId === null && categoryId === null
  const [loaded, setLoaded] = useState<(SpecFields & { key: string }) | null>(null)

  useEffect(() => {
    if (idle) return
    let active = true
    loadSpecFields(templateId, categoryId)
      .catch(() => NONE)
      .then((result) => {
        if (active) setLoaded({ ...result, key })
      })
    return () => {
      active = false
    }
    // `key` resume templateId e categoryId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (idle) return { ...NONE, loading: false }
  if (loaded?.key !== key) return { ...NONE, loading: true }
  return { fields: loaded.fields, commonKeys: loaded.commonKeys, loading: false }
}
