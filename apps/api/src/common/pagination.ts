/** Envelope padrão das rotas custom paginadas. */
export interface Paginated<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export interface PageParams {
  limit?: string;
  page?: string;
}

/**
 * Converte os parâmetros de query (que chegam como string, pois o
 * ValidationPipe global não transforma) em take/skip do Prisma.
 */
export function resolvePage({ limit, page }: PageParams = {}) {
  const parsedLimit = Number(limit);
  const parsedPage = Number(page);

  const take =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.trunc(parsedLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? Math.trunc(parsedPage) : 1;

  return { take, skip: (currentPage - 1) * take, page: currentPage };
}

export function buildPaginated<T>(
  docs: T[],
  totalDocs: number,
  page: number,
  limit: number,
): Paginated<T> {
  const totalPages = limit > 0 ? Math.ceil(totalDocs / limit) : 1;
  return {
    docs,
    totalDocs,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
  };
}
