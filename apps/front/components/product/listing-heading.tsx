import Link from "next/link";
import { SortControl } from "@/components/product/filters/sort-control";
import { Mono } from "@/components/ui/mono";
import type { SearchSummary } from "@/lib/catalog/search-results";
import type { CategoryWithSubcategories } from "@/types/product";
import { SearchNotice } from "./search-notice";

interface ListingHeadingProps {
  category?: CategoryWithSubcategories;
  /** Títulos das subcategorias marcadas. */
  subcategoryTitles: string[];
  totalDocs: number;
  /** O termo buscado, quando a busca aconteceu. */
  searchTerm?: string;
  search?: SearchSummary;
}

/** Trilha, título, contagem e ordenação do topo da listagem. */
export function ListingHeading({
  category,
  subcategoryTitles,
  totalDocs,
  searchTerm,
  search,
}: ListingHeadingProps) {
  // Uma subcategoria vira título; várias, o título fica na categoria e elas
  // aparecem na trilha. Com busca, o título é o termo.
  const subsLabel = subcategoryTitles.join(" + ");
  const listingTitle =
    subcategoryTitles.length === 1 ? subsLabel : (category?.title ?? "Produtos");
  const title = searchTerm ? `Resultados para “${searchTerm}”` : listingTitle;
  const trail = [category?.title, subsLabel].filter(Boolean).join(" › ");

  return (
    <>
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
        <div className="min-w-0">
          <h1 className="break-words font-heading text-[32px] uppercase leading-none md:text-[44px]">
            {title}
          </h1>
          <Mono as="div" className="mt-1 text-ink/55">
            {totalDocs} {totalDocs === 1 ? "produto" : "produtos"}
            {trail && ` · ${trail}`}
          </Mono>
          {search && totalDocs > 0 && <SearchNotice search={search} />}
        </div>
        <SortControl className="hidden lg:block" />
      </div>
    </>
  );
}
