import Link from "next/link";
import type { Product } from "@/types/product";
import { ProductImage } from "@/components/ui/product-image";

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
        <ProductImage
          src={product.productMainImg}
          alt={product.name}
          aspectRatio={aspectRatio}
          imageClassName="transition-transform duration-300 group-hover/card:scale-105"
        />
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
