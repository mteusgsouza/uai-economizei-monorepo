"use client";

import { useCallback } from "react";
import usePageParams from "@/hooks/usePageParams";

/** Os parâmetros que a listagem entende — usados para limpar e contar filtros. */
export const FILTER_KEYS = [
  "categoria",
  "subcategoria",
  "marca",
  "precoMin",
  "precoMax",
  "pix",
  "promocao",
] as const;

/**
 * Leitura e escrita dos filtros na URL. A listagem inteira é server-rendered a
 * partir da query string, então filtrar é navegar — não há estado local para
 * sincronizar.
 */
export function useFilterParams() {
  const { searchParams, router, pathname } = usePageParams();

  const commit = useCallback(
    (params: URLSearchParams) => {
      // Qualquer mudança de filtro volta para a primeira página.
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const set = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      commit(params);
    },
    [commit, searchParams],
  );

  /** Liga/desliga um valor: clicar no que já está ativo remove o filtro. */
  const toggle = useCallback(
    (key: string, value: string) => {
      set(key, searchParams.get(key) === value ? null : value);
    },
    [searchParams, set],
  );

  const setMany = useCallback(
    (entries: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(entries)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      commit(params);
    },
    [commit, searchParams],
  );

  const clear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) params.delete(key);
    commit(params);
  }, [commit, searchParams]);

  const get = useCallback(
    (key: string) => searchParams.get(key) ?? undefined,
    [searchParams],
  );

  /** Lê um parâmetro de múltiplos valores ("a,b,c"). */
  const getList = useCallback(
    (key: string): string[] => {
      const raw = searchParams.get(key);
      return raw ? raw.split(",").filter(Boolean) : [];
    },
    [searchParams],
  );

  /**
   * Liga/desliga um valor dentro de uma lista, aplicando de quebra os outros
   * parâmetros que precisam mudar junto (ex.: a categoria dona da
   * subcategoria escolhida).
   */
  const toggleInList = useCallback(
    (key: string, value: string, alongside: Record<string, string | null> = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(alongside)) {
        if (v === null || v === "") params.delete(k);
        else params.set(k, v);
      }

      const current = (params.get(key)?.split(",").filter(Boolean) ?? []).slice();
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      if (next.length === 0) params.delete(key);
      else params.set(key, next.join(","));

      commit(params);
    },
    [commit, searchParams],
  );

  const activeCount = FILTER_KEYS.filter((key) => searchParams.get(key)).length;

  return {
    get,
    getList,
    set,
    toggle,
    toggleInList,
    setMany,
    clear,
    activeCount,
    searchParams,
  };
}
