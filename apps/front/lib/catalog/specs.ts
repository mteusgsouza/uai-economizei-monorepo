import { unstable_cache } from "next/cache";

import { relationId } from "@/lib/relation-id";
import { buildSpecSheet } from "@/lib/specs/format";
import type { SpecGroup } from "@/lib/specs/types";
import { mergeSpecFields, parseSpecValues, toSpecFieldDefs } from "@/lib/specs/values";
import { getPayloadClient } from "./payload-client";

async function fetchSpecSheet(productId: number): Promise<SpecGroup[]> {
  const payload = await getPayloadClient();
  try {
    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 1,
      select: { specs: true, specTemplate: true, category: true },
    });

    const values = parseSpecValues(product.specs);
    if (Object.keys(values).length === 0) return [];

    const model = typeof product.specTemplate === "object" ? product.specTemplate : null;
    const categoryId = relationId(product.category);
    const common =
      categoryId === null
        ? []
        : (
            await payload.find({
              collection: "spec-templates",
              where: { scope: { equals: "category" }, category: { equals: categoryId } },
              depth: 0,
              limit: 20,
            })
          ).docs;

    const fields = mergeSpecFields(
      toSpecFieldDefs(model?.fields),
      common.flatMap((template) => toSpecFieldDefs(template.fields)),
    );
    return buildSpecSheet(fields, values);
  } catch {
    return [];
  }
}

/**
 * Ficha técnica pronta para exibir: valores do produto com nome, unidade e
 * grupo vindos do modelo. Invalidada pela tag `products`, que também é
 * disparada quando um modelo muda.
 */
export const getProductSpecSheet = unstable_cache(
  (productId: number) => fetchSpecSheet(productId),
  ["catalog-product-specs"],
  { tags: ["products"], revalidate: 600 },
);
