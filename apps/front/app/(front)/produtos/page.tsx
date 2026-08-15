import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { FilterChips } from "@/components/product/filters/filter-chips";
import { FiltersPanel } from "@/components/product/filters/filters-panel";
import { ProductsToolbar } from "@/components/product/filters/products-toolbar";
import { SortControl } from "@/components/product/filters/sort-control";
import { SubcategoryBand } from "@/components/product/filters/subcategory-band";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { getProducts, type ProductQuery } from "@/lib/catalog/products";
import {
  getBrands,
  getCategories,
  getCategoryCounts,
  getSubcategoryCounts,
} from "@/lib/catalog/taxonomy";
import { getStoreSettings } from "@/lib/catalog/settings";

const PAGE_SIZE = 24;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildQuery(params: SearchParams): ProductQuery {
  const sortBy = first(params.sortBy);
  const sortOrder = first(params.sortOrder);
  const valid = ["name", "value", "stock", "discount"] as const;
  return {
    page: toNumber(first(params.page)) ?? 1,
    limit: PAGE_SIZE,
    categorySlug: first(params.categoria),
    brandName: first(params.marca),
    subcategorySlugs: first(params.subcategoria)?.split(",").filter(Boolean),
    precoMin: toNumber(first(params.precoMin)),
    precoMax: toNumber(first(params.precoMax)),
    pixDiscount: first(params.pix) === "1",
    onSale: first(params.promocao) === "1",
    search: first(params.search),
    sortBy: valid.find((v) => v === sortBy),
    sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
  };
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requested = buildQuery(params);

  const categories = await getCategories();
  const category = categories.find((c) => c.categorySlug === requested.categorySlug);

  // Subcategoria de outra categoria não filtra nada — um link antigo com o par
  // trocado voltaria lista vazia. Descarta o que não pertence e mostra a
  // categoria inteira em vez de um resultado impossível.
  const selectedSubs = (requested.subcategorySlugs ?? [])
    .map((slug) => category?.subcategories.find((s) => s.subcatSlug === slug))
    .filter(Boolean) as { title: string; subcatSlug: string }[];

  const query = {
    ...requested,
    subcategorySlugs: selectedSubs.length
      ? selectedSubs.map((s) => s.subcatSlug)
      : undefined,
  };

  const [result, brands, counts, settings, subcategoryCounts] = await Promise.all([
    getProducts(query),
    getBrands(query.categorySlug),
    getCategoryCounts(),
    getStoreSettings(),
    getSubcategoryCounts(),
  ]);

  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const v = first(value);
    if (v) flat[key] = v;
  }

  // Uma subcategoria vira título; várias, o título fica na categoria e elas
  // aparecem na trilha.
  const subsLabel = selectedSubs.map((s) => s.title).join(" + ");
  const title =
    selectedSubs.length === 1 ? subsLabel : (category?.title ?? "Produtos");
  const trail = [category?.title, subsLabel].filter(Boolean).join(" › ");
  const from = (result.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(result.page * PAGE_SIZE, result.totalDocs);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-7 md:px-10 md:pb-[72px]">
      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        {" / "}
        <Link href="/categorias" className="hover:text-accent-700">
          Categorias
        </Link>
        {category && (
          <>
            {" / "}
            <Link
              href={`/produtos?categoria=${category.categorySlug}`}
              className="hover:text-accent-700"
            >
              {category.title}
            </Link>
          </>
        )}
        {subsLabel && <span className="text-ink"> / {subsLabel}</span>}
      </Mono>

      <div className="mt-3 flex flex-col gap-4 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-[32px] uppercase leading-none md:text-[44px]">
            {title}
          </h1>
          <Mono as="div" className="mt-1 text-ink/55">
            {result.totalDocs} {result.totalDocs === 1 ? "produto" : "produtos"}
            {trail && ` · ${trail}`}
          </Mono>
        </div>
        <SortControl className="hidden lg:block" />
      </div>

      <ProductsToolbar
        categories={categories}
        brands={brands}
        categoryCounts={counts.byCategory}
        subcategoryCounts={subcategoryCounts}
      />

      {category && (
        <SubcategoryBand category={category} counts={subcategoryCounts} />
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[248px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FiltersPanel
              categories={categories}
              brands={brands}
              categoryCounts={counts.byCategory}
              subcategoryCounts={subcategoryCounts}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <FilterChips categories={categories} />

          {result.docs.length === 0 ? (
            <EmptyState
              title="Nada por aqui"
              description="Nenhum produto com esses filtros."
              actionLabel="Limpar filtros"
              actionHref="/produtos"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
              {result.docs.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageAspect="4/3"
                  pixDiscountPercent={settings.pixDiscountPercent}
                  maxInstallments={settings.maxInstallments}
                />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-divider pt-4 sm:flex-row">
              <Mono className="text-ink/50">
                Exibindo {from}–{to} de {result.totalDocs}
                {subsLabel ? ` em ${subsLabel}` : ""}
              </Mono>
              <PaginationNav
                page={result.page}
                totalPages={result.totalPages}
                basePath="/produtos"
                searchParams={flat}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
