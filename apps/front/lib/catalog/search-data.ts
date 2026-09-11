import type { Payload, Where } from "payload";
import type { SearchDoc } from "@/lib/search/types";
import { subcategoryTitle } from "./map-product";

/**
 * Candidatos da busca: só o texto de cada produto que passa pelos filtros,
 * na ordem da vitrine (mais novo primeiro), que desempata o ranking.
 */
export async function loadSearchDocs(payload: Payload, where: Where): Promise<SearchDoc[]> {
  const result = await payload.find({
    collection: "products",
    where,
    sort: "-createdAt",
    pagination: false,
    depth: 1,
    select: { name: true, brand: true, category: true, subcategory: true },
    populate: {
      brands: { name: true },
      categories: { title: true, subcategories: true },
    },
  });

  return result.docs.map((doc) => {
    const brand = typeof doc.brand === "object" && doc.brand !== null ? doc.brand.name : null;
    const category =
      typeof doc.category === "object" && doc.category !== null ? doc.category : null;
    const subcategory = category ? subcategoryTitle(category, doc.subcategory) : null;

    return {
      id: doc.id,
      name: doc.name,
      brand,
      taxonomy: [category?.title, subcategory].filter((text): text is string => Boolean(text)),
    };
  });
}

/** Os cadastros de sinônimos, do jeito que o lojista escreveu. */
export async function loadSynonymRows(payload: Payload): Promise<string[]> {
  const result = await payload.find({
    collection: "search-synonyms",
    pagination: false,
    depth: 0,
    select: { terms: true },
  });
  return result.docs.map((doc) => doc.terms);
}
