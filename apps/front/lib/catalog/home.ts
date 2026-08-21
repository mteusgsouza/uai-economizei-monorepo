import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import type { Product as PayloadProduct } from "@/payload-types";
import type { HomeBrand, HomeCategory, HomeData } from "@/types/home";
import type { Product } from "@/types/product";
import { AVAILABLE } from "./filters";
import { mapProduct, mapSubcategories } from "./map-product";
import { getPayloadClient } from "./payload-client";

// Mesmo critério de lib/catalog/taxonomy.ts: teto em vez de "todas" (limit: 0).
const CATEGORIES_LIST_LIMIT = 200;

function findActive(payload: Payload, extra: Where[], limit: number) {
  return payload.find({
    collection: "products",
    where: { and: [...AVAILABLE, ...extra] },
    sort: "-createdAt",
    limit,
    depth: 1,
  });
}

/** Batch leve para agregações (marcas, capas, preço de entrada, desconto). */
function findBatch(payload: Payload) {
  return payload.find({
    collection: "products",
    where: { and: AVAILABLE },
    sort: "-createdAt",
    limit: 200,
    depth: 1,
    select: {
      name: true,
      price: true,
      discountPercent: true,
      productMainImg: true,
      brand: true,
      category: true,
    },
  });
}

function aggregateTopBrands(batch: Product[]): HomeBrand[] {
  const byBrand = new Map<number, { name: string; products: Product[] }>();
  for (const product of batch) {
    if (!product.brand) continue;
    const entry = byBrand.get(product.brand.id) ?? { name: product.brand.name, products: [] };
    if (entry.products.length < 8) entry.products.push(product);
    byBrand.set(product.brand.id, entry);
  }
  return [...byBrand.entries()]
    .sort((a, b) => b[1].products.length - a[1].products.length)
    .slice(0, 6)
    .map(([id, { name, products }]) => ({
      id,
      name,
      productCount: products.length,
      products,
    }));
}

async function fetchHomeData(): Promise<HomeData> {
  const payload = await getPayloadClient();

  const [latestRes, categoriesRes, batchRes] = await Promise.all([
    // "Novidades" é o que entrou por último no catálogo — `findActive` já ordena
    // por `-createdAt`. Antes isto filtrava por `isNew`, que na verdade guarda o
    // estado de conservação (novo/usado), não data de entrada: com o campo
    // recuperado, filtrar por ele traria os ~1000 produtos novos de fábrica.
    findActive(payload, [], 4),
    payload.find({
      collection: "categories",
      sort: "title",
      limit: CATEGORIES_LIST_LIMIT,
      depth: 0,
      select: {
        title: true,
        categorySlug: true,
        image: true,
        subcategories: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    findBatch(payload),
  ]);

  const batch = (batchRes.docs as PayloadProduct[]).map((doc) => mapProduct(doc));

  const categories: HomeCategory[] = categoriesRes.docs.map((cat) => {
    const ofCategory = batch.filter((p) => p.category?.id === cat.id);
    const prices = ofCategory.map((p) => p.value).filter((v) => v > 0);
    return {
      id: cat.id,
      title: cat.title,
      categorySlug: cat.categorySlug,
      subcategories: mapSubcategories(cat),
      productImage: ofCategory.find((p) => p.productMainImg)?.productMainImg ?? cat.image ?? null,
      minPrice: prices.length ? Math.min(...prices) : null,
    };
  });

  return {
    newArrivals: latestRes.docs.map((doc) => mapProduct(doc)),
    categories,
    topBrands: aggregateTopBrands(batch),
    maxDiscountPercent: batch.reduce((max, p) => Math.max(max, p.discountPercent), 0),
  };
}

/** Dados agregados da home, cacheados por 5 min (tags: products/categories/brands). */
export const getHomeData = unstable_cache(fetchHomeData, ["catalog-home"], {
  tags: ["products", "categories", "brands"],
  revalidate: 300,
});
