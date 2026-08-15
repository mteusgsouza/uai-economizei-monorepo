import Link from "next/link";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { cn } from "@workspace/ui/lib/utils";
import type { HomeCategory } from "@/types/home";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";

/**
 * Uma célula do índice de categorias: figura quadrada duotone, nome condensado
 * e o preço de entrada da categoria. Sem moldura própria — a célula vive dentro
 * da grade, que desenha os fios.
 */
export function CategoryCard({
  category,
  className,
}: {
  category: HomeCategory;
  className?: string;
}) {
  return (
    <Link
      href={`/produtos?categoria=${category.categorySlug}`}
      className={cn("ccell block p-3.5 text-inherit md:p-5", className)}
    >
      <div className="duotone mb-3">
        <ProductImage
          src={category.productImage}
          alt={category.title}
          aspectRatio="1/1"
          sizes="(max-width: 768px) 50vw, 16vw"
        />
      </div>
      <div className="font-heading text-base uppercase leading-tight md:text-lg">
        {category.title}
      </div>
      {category.minPrice !== null && (
        <Mono as="div" className="text-accent-700">
          a partir de {formatPrice(category.minPrice)}
        </Mono>
      )}
    </Link>
  );
}
