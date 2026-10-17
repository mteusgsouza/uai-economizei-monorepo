import type { SpecTemplate } from '../../../../payload-types'

/** O que o campo da ficha usa de um modelo lido pela REST (`depth: 0`). */
export type TemplateDoc = Pick<SpecTemplate, 'id' | 'name' | 'subcategories' | 'fields'>

type Filters = Record<string, string | number>

function query(filters: Filters): string {
  const params = new URLSearchParams({ depth: '0', limit: '100', sort: 'name' })
  for (const [field, value] of Object.entries(filters)) {
    params.set(`where[${field}][equals]`, String(value))
  }
  return params.toString()
}

export async function fetchTemplate(id: number): Promise<TemplateDoc | null> {
  const res = await fetch(`/api/spec-templates/${id}?depth=0`)
  return res.ok ? ((await res.json()) as TemplateDoc) : null
}

export async function fetchTemplates(filters: Filters): Promise<TemplateDoc[]> {
  const res = await fetch(`/api/spec-templates?${query(filters)}`)
  if (!res.ok) return []
  const { docs } = (await res.json()) as { docs?: TemplateDoc[] }
  return docs ?? []
}
