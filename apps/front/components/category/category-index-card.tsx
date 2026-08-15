import Link from "next/link";
import type { CategoryWithSubcategories } from "@/types/product";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";
import { Tag } from "@/components/ui/tag";

interface CategoryIndexCardProps {
  category: CategoryWithSubcategories;
  /** Capa: a imagem da categoria ou a de um produto representativo. */
  image?: string | null;
  count?: number;
}

/**
 * O cartão do índice de categorias: figura panorâmica duotone, título
 * condensado com a contagem à direita e as subcategorias como etiquetas — um
 * sumário do que tem lá dentro.
 *
 * Difere do `CategoryCard` da home, que é uma célula quadrada dentro de uma
 * grade sem moldura própria.
 */
export function CategoryIndexCard({ category, image, count }: CategoryIndexCardProps) {
  return (
    <Link
      href={`/produtos?categoria=${category.categorySlug}`}
      className="pcard blueprint block text-inherit"
    >
      <div className="duotone">
        <ProductImage
          src={image}
          alt={category.title}
          aspectRatio="16/9"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="border-t border-divider p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading text-[22px] uppercase leading-tight md:text-[26px]">
            {category.title}
          </h2>
          {count !== undefined && <Mono className="text-ink/50">{count}</Mono>}
        </div>
        {category.subcategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {category.subcategories.slice(0, 6).map((sub) => (
              <Tag key={sub.subcatSlug} variant="neutral">
                {sub.title}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
