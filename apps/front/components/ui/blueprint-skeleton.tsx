import { cn } from "@workspace/ui/lib/utils";

/**
 * Bloco de carregamento do sistema: fundo tingido no aço com uma varredura
 * clara passando por cima. Substitui o `Skeleton` do shadcn nas telas do
 * storefront — a diferença é o tingimento e o canto reto.
 */
export function BlueprintSkeleton({ className }: { className?: string }) {
  return <div className={cn("sk", className)} aria-hidden />;
}

/**
 * Barra fina de progresso indeterminado, ancorada sob o cabeçalho enquanto
 * uma navegação está em voo.
 */
export function LoadBar({ className }: { className?: string }) {
  return (
    <div className={cn("loadbar", className)} role="progressbar" aria-label="Carregando">
      <i />
    </div>
  );
}
