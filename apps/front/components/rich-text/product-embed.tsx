import Link from "next/link";

import { ProductCardCompact } from "@/components/product/product-card-compact";
import { getProduct } from "@/lib/catalog/products";

/** Campos do bloco `product-embed` registrado no editor Lexical. */
export interface ProductEmbedFields {
  blockName?: string | null;
  blockType: "product-embed";
  productId: string;
  layout?: ("card" | "inline" | "banner") | null;
}

type ProductEmbedProps = Pick<ProductEmbedFields, "productId" | "layout">;

/**
 * Renderiza o produto embutido no meio do texto. Some em silêncio quando o ID
 * não existe mais ou o produto foi desativado — conteúdo editorial não deve
 * derrubar a página por causa de uma referência velha.
 */
export async function ProductEmbed({ productId, layout }: ProductEmbedProps) {
  const id = Number(productId);
  if (!Number.isInteger(id)) return null;

  const product = await getProduct(id);
  if (!product) return null;

  if (layout === "inline") {
    return <Link href={`/produtos/${product.id}`}>{product.name}</Link>;
  }

  return (
    <div className="my-6 flex justify-center">
      <ProductCardCompact product={product} />
    </div>
  );
}
