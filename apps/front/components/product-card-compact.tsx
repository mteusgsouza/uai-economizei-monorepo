import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import type { Product, CategoryWithSubcategories } from "@/types/product";

interface ProductCardCompactProps {
  product: Product;
  aspectRatio?: "3/4" | "2/3";
}

export function ProductCardCompact({ product, aspectRatio = "3/4" }: ProductCardCompactProps) {
  return (
    <Link
      href={`/produtos/${product.id}`}
      className="shrink-0 w-[150px] snap-start group/card"
    >
      <div className="overflow-hidden rounded-lg border border-hairline bg-canvas transition-all duration-300 group-hover/card:shadow-md group-hover/card:-translate-y-0.5">
        <div className={`relative aspect-[${aspectRatio}] overflow-hidden bg-surface`}>
          {product.productMainImg ? (
            <img
              src={product.productMainImg}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone text-xs">
              Sem imagem
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold leading-snug text-ink line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <p className="mt-1 text-xs text-steel line-clamp-1">
              {product.brand.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

interface CategoryCardProps {
  category: CategoryWithSubcategories;
  imageProduct?: Product | null;
  className?: string;
}

export function CategoryCard({ category, imageProduct, className }: CategoryCardProps) {
  const imageUrl = category.image || imageProduct?.productMainImg;

  return (
    <Link
      href={`/produtos?categoria=${category.categorySlug}`}
      className={cn("group/cat relative overflow-hidden rounded-xl", className)}
    >
      <div className="aspect-[2/3] overflow-hidden bg-surface">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover/cat:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-hero-dark-from to-hero-dark-to p-4">
            <span className="text-center text-sm font-medium text-on-dark-muted">
              {category.title}
            </span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="text-sm font-semibold text-on-dark">{category.title}</span>
        {category.subcategories && category.subcategories.length > 0 && (
          <span className="mt-1 block text-xs text-on-dark-muted">
            {category.subcategories.length} {category.subcategories.length === 1 ? "subcategoria" : "subcategorias"}
          </span>
        )}
      </div>
    </Link>
  );
}
