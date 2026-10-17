const STORAGE_KEY = "store-recently-viewed";

/** O evento `storage` só chega às outras abas; este avisa a própria. */
const CHANGE_EVENT = "store-recently-viewed-change";

/**
 * Guarda mais do que a página mostra: produto que saiu do ar ou foi apagado
 * cai fora na hora de exibir, e a sobra da fila cobre o buraco.
 */
const MAX_STORED = 12;

/*
 * Histórico de produtos vistos, do mais recente para o mais antigo. Vive só no
 * navegador, como o carrinho: não exige login e nada disso sai do aparelho.
 */

/** Snapshot cru para `useSyncExternalStore` — string compara por valor. */
export function readRecentlyViewedRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseRecentlyViewed(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => Number.isInteger(id));
  } catch {
    // corrupted data
    return [];
  }
}

export function subscribeRecentlyViewed(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(ids: number[]): void {
  try {
    if (ids.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage full or unavailable
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Põe o produto na frente da fila, sem duplicar. */
export function recordView(productId: number): void {
  const previous = parseRecentlyViewed(readRecentlyViewedRaw());
  write([productId, ...previous.filter((id) => id !== productId)].slice(0, MAX_STORED));
}

export function clearRecentlyViewed(): void {
  write([]);
}
