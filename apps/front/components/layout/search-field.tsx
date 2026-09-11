"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm, type SearchFieldProps } from "./search-form";

/** Lê o termo da URL; a `key` remonta o campo quando ela muda (chip, voltar). */
function UrlSearchForm(props: SearchFieldProps) {
  const term = useSearchParams().get("search") ?? "";
  return <SearchForm key={term} {...props} initialTerm={term} />;
}

/**
 * Busca do catálogo, com o termo buscado continuando no campo. O Suspense é
 * exigido pelo `useSearchParams`: o header também aparece em rotas estáticas.
 */
export function SearchField(props: SearchFieldProps) {
  return (
    <Suspense fallback={<SearchForm {...props} initialTerm="" />}>
      <UrlSearchForm {...props} />
    </Suspense>
  );
}
