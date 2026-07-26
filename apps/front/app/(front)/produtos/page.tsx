import { Package } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product/product-card";
import { FiltersPanel } from "@/components/product/filters/filters-panel";
import { ProductsToolbar } from "@/components/product/filters/products-toolbar";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { getProducts, type ProductQuery } from "@/lib/catalog/products";
import { getBrands, getCategories } from "@/lib/catalog/taxonomy";

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
  return {
    page: toNumber(first(params.page)) ?? 1,
    limit: PAGE_SIZE,
    categorySlug: first(params.categoria),
    brandName: first(params.marca),
    subcategorySlug: first(params.subcategoria),
    precoMin: toNumber(first(params.precoMin)),
    precoMax: toNumber(first(params.precoMax)),
    search: first(params.search),
    sortBy: sortBy === "name" || sortBy === "value" || sortBy === "stock" ? sortBy : undefined,
    sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
  };
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = buildQuery(params);

  const [result, categories, brands] = await Promise.all([
    getProducts(query),
    getCategories(),
    getBrands(query.categorySlug),
  ]);

  const flatParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const v = first(value);
    if (v) flatParams[key] = v;
  }

  const hasActiveFilters = !!(
    query.categorySlug ||
    query.subcategorySlug ||
    query.brandName ||
    query.precoMin ||
    query.precoMax
  );

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-8">
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.005em] text-ink md:text-4xl">
            Produtos
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Explore nossa colecao completa de produtos.
          </p>
          <div className="mt-12 flex gap-8">
            <aside className="hidden w-60 shrink-0 lg:block">
              <div className="sticky top-24">
                <h2 className="mb-4 text-sm font-semibold tracking-wider text-ink uppercase">
                  Filtros
                </h2>
                <FiltersPanel categories={categories} brands={brands} />
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <ProductsToolbar
                categories={categories}
                brands={brands}
                totalDocs={result.totalDocs}
              />

              {result.docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="mb-4 h-12 w-12 text-stone" />
                  <p className="text-steel">
                    {hasActiveFilters
                      ? "Nenhum produto encontrado com os filtros selecionados."
                      : "Nenhum produto disponivel no momento."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {result.docs.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              <PaginationNav
                page={result.page}
                totalPages={result.totalPages}
                basePath="/produtos"
                searchParams={flatParams}
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
