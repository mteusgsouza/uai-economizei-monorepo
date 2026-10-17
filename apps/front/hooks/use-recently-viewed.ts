"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  parseRecentlyViewed,
  readRecentlyViewedRaw,
  subscribeRecentlyViewed,
} from "@/lib/recently-viewed";

/** No servidor não há histórico: a hidratação parte vazia e preenche depois. */
const serverSnapshot = () => null;

/** Ids dos produtos vistos neste navegador, do mais recente para o mais antigo. */
export function useRecentlyViewed(): number[] {
  const raw = useSyncExternalStore(
    subscribeRecentlyViewed,
    readRecentlyViewedRaw,
    serverSnapshot,
  );
  return useMemo(() => parseRecentlyViewed(raw), [raw]);
}
