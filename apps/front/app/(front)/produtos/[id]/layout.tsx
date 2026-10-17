import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog/products";

type Args = { children: React.ReactNode; params: Promise<{ id: string }> };

/**
 * Confere se o produto existe antes do Suspense do `loading.tsx` deste
 * segmento, que embrulha só a página. Um `notFound()` dentro do boundary chega
 * depois que o shell já saiu com status 200; aqui fora o Next ainda consegue
 * responder 404. A página busca o produto de novo, mas o `unstable_cache` atende.
 */
export default async function ProductLayout({ children, params }: Args) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId) || !(await getProduct(productId))) notFound();

  return children;
}
