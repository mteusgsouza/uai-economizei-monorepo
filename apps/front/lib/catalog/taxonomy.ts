import { unstable_cache } from "next/cache";
import type { Brand, CategoryWithSubcategories } from "@/types/product";
import { mapBrandDoc, mapCategory } from "./map-product";
import { getPayloadClient } from "./payload-client";

async function fetchCategories(): Promise<CategoryWithSubcategories[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "categories",
    sort: "title",
    limit: 0,
    depth: 0,
  });
  return result.docs.map(mapCategory);
}

/** Todas as categorias com subcategorias, ordenadas por título. */
export const getCategories = unstable_cache(fetchCategories, ["catalog-categories"], {
  tags: ["categories"],
  revalidate: 600,
});

async function fetchBrands(categorySlug?: string): Promise<Brand[]> {
  const payload = await getPayloadClient();

  // Com filtro de categoria: extrai as marcas dos produtos daquela categoria
  if (categorySlug) {
    const products = await payload.find({
      collection: "products",
      where: {
        and: [
          { active: { equals: true } },
          { "category.categorySlug": { equals: categorySlug } },
        ],
      },
      limit: 0,
      depth: 1,
      select: { brand: true },
    });

    const seen = new Map<number, Brand>();
    for (const doc of products.docs) {
      if (typeof doc.brand === "object" && doc.brand !== null) {
        seen.set(doc.brand.id, { id: doc.brand.id, name: doc.brand.name });
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const result = await payload.find({
    collection: "brands",
    sort: "name",
    limit: 0,
    depth: 0,
  });
  return result.docs.map(mapBrandDoc);
}

/** Marcas, opcionalmente restritas às que têm produtos na categoria. */
export const getBrands = unstable_cache(
  (categorySlug?: string) => fetchBrands(categorySlug),
  ["catalog-brands"],
  { tags: ["brands", "products"], revalidate: 600 },
);
