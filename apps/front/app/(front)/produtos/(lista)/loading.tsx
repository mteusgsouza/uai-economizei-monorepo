import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RouteLoading } from "@/components/ui/route-loading";

/**
 * Esqueleto só da listagem. Fica no grupo `(lista)` porque, em `produtos/`,
 * embrulharia também a ficha `[id]` num Suspense, e o 404 de produto
 * inexistente sairia com status 200 (ver `not-found.tsx`).
 */
export default function Loading() {
  return (
    <RouteLoading>
      <ProductGridSkeleton className="mt-7" />
    </RouteLoading>
  );
}
