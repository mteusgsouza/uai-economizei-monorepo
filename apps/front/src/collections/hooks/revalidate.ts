import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Invalida o cache do Next quando conteúdo muda no admin do Payload.
 * Import dinâmico de next/cache: os hooks também rodam na CLI do Payload
 * (generate:types, migrate), fora do runtime do Next.
 */
async function revalidate(tag: string): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag, 'max')
  } catch {
    // Fora do Next (CLI) — nada a invalidar
  }
}

export function revalidateAfterChange(tag: string): CollectionAfterChangeHook {
  return async ({ doc }) => {
    await revalidate(tag)
    return doc
  }
}

export function revalidateAfterDelete(tag: string): CollectionAfterDeleteHook {
  return async ({ doc }) => {
    await revalidate(tag)
    return doc
  }
}

export function revalidateGlobalAfterChange(tag: string): GlobalAfterChangeHook {
  return async ({ doc }) => {
    await revalidate(tag)
    return doc
  }
}
