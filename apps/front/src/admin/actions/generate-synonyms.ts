'use server'

import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { aiEnabled } from '../../../lib/ai/anthropic'
import { existingTermSet, filterNewGroups } from '../../../lib/ai/synonyms/dedupe'
import { requestSynonymGroups } from '../../../lib/ai/synonyms/request'
import { foldText } from '../../../lib/search/normalize'
import { loadSynonymSnapshot } from '../lib/synonym-catalog'

export type GenerateSynonymsResult =
  | { ok: true; created: number; skipped: number }
  | { ok: false; error: string }

/** A action é acessível por HTTP: sem a checagem de sessão vira rota aberta (e gasta a chave). */
async function ensureAdmin(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return Boolean(user)
}

export async function generateSynonymsAction(): Promise<GenerateSynonymsResult> {
  if (!(await ensureAdmin())) return { ok: false, error: 'Sessão expirada.' }
  if (!aiEnabled) {
    return { ok: false, error: 'Configure DEEPSEEK_API_KEY ou ANTHROPIC_API_KEY no servidor para usar a IA.' }
  }

  try {
    const payload = await getPayload({ config })
    const { batches, existingRows } = await loadSynonymSnapshot(payload)
    const taken = existingTermSet(existingRows)
    const rows = [...existingRows]
    let created = 0
    let skipped = 0

    for (const batch of batches) {
      const result = await requestSynonymGroups(batch, rows)
      if (!result.ok) {
        return { ok: false, error: 'A IA não pôde gerar sugestões para este catálogo.' }
      }
      const groups = result.groups

      const { kept, skipped: dropped } = filterNewGroups(groups, taken)
      skipped += dropped.length
      for (const group of kept) {
        const terms = group.join(', ')
        await payload.create({ collection: 'search-synonyms', data: { terms } })
        for (const term of group) taken.add(foldText(term))
        rows.push(terms)
        created += 1
      }
    }

    return { ok: true, created, skipped }
  } catch (err) {
    console.error('[admin] falha ao gerar sinônimos:', err)
    return { ok: false, error: 'Não foi possível gerar os sinônimos agora. Tente de novo.' }
  }
}
