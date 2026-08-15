import { cn } from "@workspace/ui/lib/utils";
import { BlueprintSkeleton } from "./blueprint-skeleton";

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * A grade de produtos enquanto carrega: a moldura do cartão já está desenhada
 * e só o conteúdo é bloco tingido — o layout não pula quando os dados chegam.
 */
export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="blueprint p-4">
          <BlueprintSkeleton className="aspect-square w-full" />
          <BlueprintSkeleton className="mt-3.5 h-3 w-[52%]" />
          <BlueprintSkeleton className="mt-2 h-5 w-full" />
          <BlueprintSkeleton className="mt-1.5 h-5 w-[70%]" />
          <BlueprintSkeleton className="mt-3.5 h-[30px] w-[58%]" />
          <BlueprintSkeleton className="mt-3.5 h-[34px] w-full" />
        </div>
      ))}
    </div>
  );
}
