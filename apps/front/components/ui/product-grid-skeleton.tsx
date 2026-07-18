import { Skeleton } from "@workspace/ui/components/skeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

/**
 * Skeleton placeholder for product grids while loading.
 *
 * Used by FeaturedProductsSection, CategoryProductSection, and product listing pages
 * to avoid duplicating the grid-of-skeleton-cards pattern.
 */
export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
