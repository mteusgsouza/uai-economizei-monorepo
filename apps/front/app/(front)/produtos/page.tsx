import { ProductCard } from "@/components/product/product-card";
import { FilterChips } from "@/components/product/filters/filter-chips";
import { FiltersPanel } from "@/components/product/filters/filters-panel";
import { ProductsToolbar } from "@/components/product/filters/products-toolbar";
import { SubcategoryBand } from "@/components/product/filters/subcategory-band";
import { ListingEmpty } from "@/components/product/listing-empty";
import { ListingHeading } from "@/components/product/listing-heading";
import { Mono } from "@/components/ui/mono";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { loadListing } from "@/lib/catalog/listing";
import {
  buildListingQuery,
  flattenParams,
  hasActiveFilters,
  PAGE_SIZE,
  type SearchParams,
} from "@/lib/catalog/listing-params";
import {
  getBrands,
  getCategories,
  getCategoryCounts,
  getSubcategoryCounts,
} from "@/lib/catalog/taxonomy";
import { getStoreSettings } from "@/lib/catalog/settings";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requested = buildListingQuery(params);

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
    loadListing(query),
    getBrands(query.categorySlug),
    getCategoryCounts(),
    getStoreSettings(),
    getSubcategoryCounts(),
  ]);

  // Termo que não sobreviveu à limpeza ("   ") não é busca: a tela fica normal.
  const searchTerm = result.search ? requested.search?.trim() : undefined;
  const subsLabel = selectedSubs.map((s) => s.title).join(" + ");
  const from = (result.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(result.page * PAGE_SIZE, result.totalDocs);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-7 md:px-10 md:pb-[72px]">
      <ListingHeading
        category={category}
        subcategoryTitles={selectedSubs.map((s) => s.title)}
        totalDocs={result.totalDocs}
        searchTerm={searchTerm}
        search={result.search}
      />

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
            <ListingEmpty searchTerm={searchTerm} filtersActive={hasActiveFilters(params)} />
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
                searchParams={flattenParams(params)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
