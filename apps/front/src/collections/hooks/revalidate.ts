import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Invalida o cache do Next quando conteúdo muda no admin do Payload.
 * Import dinâmico de next/cache: os hooks também rodam na CLI do Payload
 * (generate:types, migrate), fora do runtime do Next.
 *
 * Expira na hora (`expire: 0`) em vez de `'max'`: com `'max'` a primeira visita
 * depois de salvar ainda recebia a versão velha — quem confere pelo "Ver na
 * loja" via o produto antigo, e um cliente podia ver o preço anterior. O admin
 * salva pela REST (Route Handler), onde `updateTag` não está disponível.
 */
async function revalidate(tag: string): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag, { expire: 0 })
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
