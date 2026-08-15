import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * O vazio também é um objeto desenhado: moldura de fio, título condensado e
 * uma saída. Aparece em listagem sem resultado, favoritos e pedidos.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="blueprint px-6 py-8 text-center">
      <div className="font-heading text-xl uppercase">{title}</div>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-ink/60">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button asChild variant="outline" className="mt-3.5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
