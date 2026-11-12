'use server'

import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod/v4'

import { AI_MODEL, aiEnabled, getAnthropicClient } from '../../../lib/ai/anthropic'
import { existingTermSet, filterNewGroups } from '../../../lib/ai/synonyms/dedupe'
import { SYNONYMS_SYSTEM, buildUserMessage } from '../../../lib/ai/synonyms/prompt'
import { foldText } from '../../../lib/search/normalize'
import { loadSynonymSnapshot } from '../lib/synonym-catalog'

const GroupsSchema = z.object({ groups: z.array(z.array(z.string())) })

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
    return { ok: false, error: 'Configure ANTHROPIC_API_KEY no servidor para usar a IA.' }
  }

  try {
    const payload = await getPayload({ config })
    const { batches, existingRows } = await loadSynonymSnapshot(payload)
    const client = getAnthropicClient()
    const taken = existingTermSet(existingRows)
    const rows = [...existingRows]
    let created = 0
    let skipped = 0

    for (const batch of batches) {
      const response = await client.messages.parse({
        model: AI_MODEL,
        max_tokens: 4000,
        system: SYNONYMS_SYSTEM,
        messages: [{ role: 'user', content: buildUserMessage(batch, rows) }],
        output_config: { effort: 'low', format: zodOutputFormat(GroupsSchema) },
      })

      if (response.stop_reason === 'refusal') {
        return { ok: false, error: 'A IA não pôde gerar sugestões para este catálogo.' }
      }
      const groups = response.parsed_output?.groups ?? []

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
