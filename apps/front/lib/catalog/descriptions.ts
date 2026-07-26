import { unstable_cache } from "next/cache";
import { lexicalToHtml } from "./lexical";
import { getPayloadClient } from "./payload-client";

export interface ProductRichDescription {
  description_html: string;
  specs: Record<string, string>;
}

async function fetchProductDescription(
  productId: string,
): Promise<ProductRichDescription | null> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "product-descriptions",
    where: { productId: { equals: productId } },
    limit: 1,
    depth: 0,
  });

  const doc = docs[0];
  if (!doc) return null;

  const specs: Record<string, string> = {};
  if (typeof doc.specs === "object" && doc.specs !== null && !Array.isArray(doc.specs)) {
    for (const [key, value] of Object.entries(doc.specs)) {
      specs[key] = String(value);
    }
  }

  return {
    description_html: lexicalToHtml(doc.description),
    specs,
  };
}

/** Descrição rica (product-descriptions) associada a um produto. */
export const getProductDescription = unstable_cache(
  (productId: string) => fetchProductDescription(productId),
  ["catalog-product-description"],
  { tags: ["products"], revalidate: 600 },
);
