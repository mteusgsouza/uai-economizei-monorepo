import Link from "next/link";
import type { Product } from "@/types/product";

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
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold leading-snug text-ink line-clamp-2">
            {product.name}
          </h3>
          {product.authors.length > 0 && (
            <p className="mt-1 text-xs text-steel line-clamp-1">
              {product.authors.join(", ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

interface CategoryCardProps {
  genre: string;
  label: string;
  product: Product;
}

export function CategoryCard({ genre, label, product }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias#${genre.toLowerCase()}`}
      className="shrink-0 w-[200px] snap-start group/cat relative overflow-hidden rounded-xl"
    >
      <div className="aspect-[2/3] overflow-hidden bg-surface">
        <img
          src={product.image}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/cat:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="text-sm font-semibold text-on-dark">{label}</span>
      </div>
    </Link>
  );
}
