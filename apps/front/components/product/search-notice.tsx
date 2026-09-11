import type { SearchSummary } from "@/lib/catalog/search-results";

/** Avisos da busca: o termo depois da correção e quando nem todos os termos casaram. */
export function SearchNotice({ search }: { search: SearchSummary }) {
  if (!search.correctedTerm && search.mode === "all") return null;

  return (
    <div className="mt-2 space-y-0.5 text-[13px] text-ink/70">
      {search.correctedTerm && (
        <p>
          Mostrando resultados para{" "}
          <strong className="font-semibold text-ink">“{search.correctedTerm}”</strong>.
        </p>
      )}
      {search.mode === "any" && (
        <p>Nenhum produto tem todos os termos — mostrando os mais próximos.</p>
      )}
    </div>
  );
}
