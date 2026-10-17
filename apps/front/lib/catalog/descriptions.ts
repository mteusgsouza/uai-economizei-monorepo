import { unstable_cache } from "next/cache";
import { lexicalToHtml } from "./lexical";
import { getPayloadClient } from "./payload-client";

/** A ficha técnica saiu daqui: vive no próprio produto (ver `getProductSpecSheet`). */
export interface ProductRichDescription {
  description_html: string;
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

  return { description_html: lexicalToHtml(doc.description) };
}

/** Descrição rica (product-descriptions) associada a um produto. */
export const getProductDescription = unstable_cache(
  (productId: string) => fetchProductDescription(productId),
  ["catalog-product-description"],
  { tags: ["products"], revalidate: 600 },
);
