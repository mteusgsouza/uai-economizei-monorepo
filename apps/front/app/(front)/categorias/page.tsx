import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCategories } from "@/lib/catalog/taxonomy";
import { getProducts } from "@/lib/catalog/products";
import type { CategoryWithSubcategories } from "@/types/product";

function CategoryTile({
  category,
  imageUrl,
}: {
  category: CategoryWithSubcategories;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/produtos?categoria=${category.categorySlug}`}
      className="group/cat relative overflow-hidden rounded-xl"
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
        {category.subcategories.length > 0 && (
          <span className="mt-1 block text-xs text-on-dark-muted">
            {category.subcategories.length}{" "}
            {category.subcategories.length === 1 ? "subcategoria" : "subcategorias"}
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function CategoriasPage() {
  const [categories, { docs: products }] = await Promise.all([
    getCategories(),
    getProducts({ limit: 100 }),
  ]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Categorias
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Navegue por categorias e encontre o que mais combina com voce.
          </p>
          <div className="mt-12">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-12 w-12 text-stone mb-4" />
                <p className="text-steel">Nenhuma categoria encontrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {categories.map((category) => {
                  const rep = products.find((p) => p.category?.id === category.id);
                  const imageUrl = category.image || rep?.productMainImg || null;
                  return (
                    <CategoryTile key={category.id} category={category} imageUrl={imageUrl} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
