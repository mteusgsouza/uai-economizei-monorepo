import Link from "next/link";
import { CategoryIndexCard } from "@/components/category/category-index-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { getCategories, getCategoryCounts } from "@/lib/catalog/taxonomy";
import { getProducts } from "@/lib/catalog/products";

export const metadata = {
  title: "Índice de categorias",
};

export default async function CategoriasPage() {
  const [categories, counts, { docs: products }] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    // Amostra só para achar uma capa por categoria quando ela não tem imagem.
    getProducts({ limit: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-7 md:px-10 md:pb-[72px]">
      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        <span className="text-ink"> / Categorias</span>
      </Mono>

      <div className="mt-3 border-b border-divider pb-4">
        <h1 className="font-heading text-[32px] uppercase leading-none md:text-[44px]">
          Índice de categorias
        </h1>
        <Mono as="div" className="mt-1 text-ink/55">
          {categories.length} {categories.length === 1 ? "categoria" : "categorias"} ·{" "}
          {counts.total.toLocaleString("pt-BR")} produtos
        </Mono>
      </div>

      {categories.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            title="Nada por aqui"
            description="Nenhuma categoria cadastrada ainda."
            actionLabel="Ver produtos"
            actionHref="/produtos"
          />
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {categories.map((category) => {
            const rep = products.find((p) => p.category?.id === category.id);
            return (
              <CategoryIndexCard
                key={category.id}
                category={category}
                image={category.image || rep?.productMainImg || null}
                count={counts.byCategory[category.categorySlug]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
