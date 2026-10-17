import { unstable_cache } from "next/cache";
import type { Page } from "@/payload-types";
import { getPayloadClient } from "./payload-client";

/** Teto explícito: são páginas institucionais, não uma tabela para varrer. */
const MAX_PAGES = 200;

export interface PageIndexEntry {
  slug: string;
  updatedAt: string;
}

async function fetchPage(slug: string): Promise<Page | null> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return docs[0] ?? null;
}

/**
 * Página do CMS pelo slug. A tag `pages` é invalidada pelos hooks da collection,
 * então página criada ou editada no admin entra no ar sem deploy — inclusive um
 * slug que já tinha sido visitado e cacheado como 404.
 */
export const getPage = unstable_cache(
  (slug: string) => fetchPage(slug),
  ["cms-page"],
  { tags: ["pages"], revalidate: 300 },
);

async function fetchPageIndex(): Promise<PageIndexEntry[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "pages",
    limit: MAX_PAGES,
    select: { slug: true, updatedAt: true },
  });
  return docs.map((page) => ({ slug: page.slug, updatedAt: page.updatedAt }));
}

/**
 * Slugs de todas as páginas, para o prerender de `/[slug]`. Sem `revalidate`
 * por tempo: só é refeito quando a tag `pages` é invalidada.
 */
export const getPageIndex = unstable_cache(fetchPageIndex, ["cms-page-index"], {
  tags: ["pages"],
  revalidate: false,
});
