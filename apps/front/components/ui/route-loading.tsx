import { BlueprintSkeleton, LoadBar } from "./blueprint-skeleton";

/**
 * O esqueleto padrão de uma rota: a barra fina de progresso logo abaixo do
 * cabeçalho e os blocos do enquadramento (breadcrumb e título) já no lugar.
 * O miolo específico de cada tela entra como `children`.
 */
export function RouteLoading({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <LoadBar />
      <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6 md:px-10">
        <BlueprintSkeleton className="h-3 w-40" />
        <BlueprintSkeleton className="mt-3.5 h-10 w-72" />
        {children ?? (
          <div className="mt-7 space-y-4">
            <BlueprintSkeleton className="h-28 w-full" />
            <BlueprintSkeleton className="h-64 w-full" />
          </div>
        )}
      </div>
    </>
  );
}
