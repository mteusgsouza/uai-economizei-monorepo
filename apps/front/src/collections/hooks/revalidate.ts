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
 *
 * `paths` cobre o que a tag não alcança: na Vercel o `/sitemap.xml` é servido
 * como arquivo e ignorou o `revalidateTag` mesmo lendo dados com a tag.
 */
async function revalidate(tag: string, paths: readonly string[] = []): Promise<void> {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    revalidateTag(tag, { expire: 0 })
    for (const path of paths) revalidatePath(path)
  } catch {
    // Fora do Next (CLI) — nada a invalidar
  }
}

export function revalidateAfterChange(
  tag: string,
  paths: readonly string[] = [],
): CollectionAfterChangeHook {
  return async ({ doc }) => {
    await revalidate(tag, paths)
    return doc
  }
}

export function revalidateAfterDelete(
  tag: string,
  paths: readonly string[] = [],
): CollectionAfterDeleteHook {
  return async ({ doc }) => {
    await revalidate(tag, paths)
    return doc
  }
}

export function revalidateGlobalAfterChange(tag: string): GlobalAfterChangeHook {
  return async ({ doc }) => {
    await revalidate(tag)
    return doc
  }
}
