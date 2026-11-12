import type { Payload } from 'payload'

import { AVAILABLE } from '../../../lib/catalog/filters'
import { loadSearchDocs, loadSynonymRows } from '../../../lib/catalog/search-data'
import type { SearchDoc } from '../../../lib/search/types'

const MAX_SINGLE_BATCH = 2000
const BATCH_SIZE = 500

export interface SynonymSnapshot {
  /** Lotes de catálogo, um por chamada à IA (um só até ~2000 nomes). */
  batches: SearchDoc[][]
  existingRows: string[]
}

/** Foto do catálogo à venda e dos sinônimos cadastrados, com nomes únicos. */
export async function loadSynonymSnapshot(payload: Payload): Promise<SynonymSnapshot> {
  const [docs, existingRows] = await Promise.all([
    loadSearchDocs(payload, { and: AVAILABLE }),
    loadSynonymRows(payload),
  ])

  const seen = new Set<string>()
  const unique = docs.filter((doc) => {
    const key = doc.name.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (unique.length <= MAX_SINGLE_BATCH) return { batches: [unique], existingRows }

  const batches: SearchDoc[][] = []
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    batches.push(unique.slice(i, i + BATCH_SIZE))
  }
  return { batches, existingRows }
}
