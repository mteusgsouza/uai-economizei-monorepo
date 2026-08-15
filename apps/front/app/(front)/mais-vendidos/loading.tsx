import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading>
      <ProductGridSkeleton className="mt-7" />
    </RouteLoading>
  );
}
