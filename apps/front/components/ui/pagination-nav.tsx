import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface PaginationNavProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
}

function pageHref(basePath: string, searchParams: Record<string, string>, page: number) {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Navegação de páginas por links (server-friendly, preserva filtros da URL). */
export function PaginationNav({ page, totalPages, basePath, searchParams }: PaginationNavProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = Math.max(1, end - 4); p <= end; p++) pages.push(p);

  const linkClass =
    "flex h-9 min-w-9 items-center justify-center rounded-md border border-hairline px-2 text-sm text-steel transition-colors hover:text-ink hover:border-ink/40";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
      {page > 1 && (
        <Link href={pageHref(basePath, searchParams, page - 1)} className={linkClass} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(basePath, searchParams, p)}
          className={cn(
            linkClass,
            p === page && "border-ink bg-ink text-on-dark hover:text-on-dark",
          )}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={pageHref(basePath, searchParams, page + 1)} className={linkClass} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
