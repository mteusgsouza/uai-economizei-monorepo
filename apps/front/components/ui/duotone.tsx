import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Envelope de fotografia: dessatura a imagem e a lava no aço, como uma
 * serigrafia que recolore junto com o tema. Toda foto de conteúdo passa
 * por aqui — é o que mantém um catálogo de fotos alheias parecendo um
 * conjunto só.
 */
export function Duotone({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("duotone", className)}>{children}</div>;
}
