import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import type { Product as PayloadProduct } from "@/payload-types";
import type { HomeBrand, HomeCategory, HomeData } from "@/types/home";
import type { Product } from "@/types/product";
import { mapProduct, mapSubcategories } from "./map-product";
import { getPayloadClient } from "./payload-client";

const ACTIVE: Where = { active: { equals: true } };

function findActive(payload: Payload, extra: Where[], limit: number) {
  return payload.find({
    collection: "products",
    where: { and: [ACTIVE, ...extra] },
    sort: "-createdAt",
    limit,
    depth: 1,
  });
}

/** Batch leve para agregações (marcas e capas): só os campos necessários. */
function findBatch(payload: Payload) {
  return payload.find({
    collection: "products",
    where: { and: [ACTIVE] },
    sort: "-createdAt",
    limit: 200,
    depth: 1,
    select: { name: true, price: true, productMainImg: true, brand: true, category: true },
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
    .slice(0, 4)
    .map(([id, { name, products }]) => ({
      id,
      name,
      productCount: products.length,
      products,
    }));
}

async function fetchHomeData(): Promise<HomeData> {
  const payload = await getPayloadClient();

  const [heroRes, newRes, eletronicosRes, casaRes, categoriesRes, batchRes] =
    await Promise.all([
      findActive(payload, [], 6),
      findActive(payload, [{ isNew: { not_equals: "false" } }], 4),
      findActive(payload, [{ "category.categorySlug": { equals: "eletronicos" } }], 4),
      findActive(payload, [{ "category.categorySlug": { equals: "casa" } }], 4),
      payload.find({ collection: "categories", sort: "title", limit: 0, depth: 0 }),
      findBatch(payload),
    ]);

  const batch = (batchRes.docs as PayloadProduct[]).map((doc) => mapProduct(doc));

  const categories: HomeCategory[] = categoriesRes.docs.map((cat) => {
    const match = batch.find((p) => p.category?.id === cat.id && p.productMainImg);
    return {
      id: cat.id,
      title: cat.title,
      categorySlug: cat.categorySlug,
      subcategories: mapSubcategories(cat),
      productImage: match?.productMainImg ?? cat.image ?? null,
    };
  });

  return {
    hero: heroRes.docs.map((doc) => mapProduct(doc)),
    newArrivals: newRes.docs.map((doc) => mapProduct(doc)),
    categoryProducts: {
      eletronicos: eletronicosRes.docs.map((doc) => mapProduct(doc)),
      casa: casaRes.docs.map((doc) => mapProduct(doc)),
    },
    categories,
    topBrands: aggregateTopBrands(batch),
  };
}

/** Dados agregados da home, cacheados por 5 min (tags: products/categories/brands). */
export const getHomeData = unstable_cache(fetchHomeData, ["catalog-home"], {
  tags: ["products", "categories", "brands"],
  revalidate: 300,
});
