import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface PaginationNavProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
}

/** Janela de páginas em volta da atual — sem despejar 40 botões na régua. */
function pageWindow(page: number, totalPages: number): number[] {
  const span = 2;
  const start = Math.max(1, Math.min(page - span, totalPages - span * 2));
  const end = Math.min(totalPages, Math.max(page + span, span * 2 + 1));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function PaginationNav({
  page,
  totalPages,
  basePath,
  searchParams,
}: PaginationNavProps) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams(searchParams);
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="flex gap-1.5">
      <Button
        asChild={page > 1}
        variant="outline"
        size="icon"
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        {page > 1 ? (
          <Link href={href(page - 1)}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </Button>

      {pageWindow(page, totalPages).map((n) => (
        <Button
          key={n}
          asChild
          variant={n === page ? "default" : "outline"}
          size="icon"
          aria-current={n === page ? "page" : undefined}
        >
          <Link href={href(n)}>{n}</Link>
        </Button>
      ))}

      <Button
        asChild={page < totalPages}
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        {page < totalPages ? (
          <Link href={href(page + 1)}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </div>
  );
}
