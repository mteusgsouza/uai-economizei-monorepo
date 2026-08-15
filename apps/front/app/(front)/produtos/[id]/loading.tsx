import { BlueprintSkeleton, LoadBar } from "@/components/ui/blueprint-skeleton";

/** A ficha do produto: miniaturas, figura principal e o painel de compra. */
export default function Loading() {
  return (
    <>
      <LoadBar />
      <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6 md:px-10">
        <BlueprintSkeleton className="h-3 w-56" />

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[88px_1fr_400px]">
          <div className="hidden flex-col gap-2.5 lg:flex">
            {Array.from({ length: 4 }).map((_, index) => (
              <BlueprintSkeleton key={index} className="aspect-square w-full" />
            ))}
          </div>
          <BlueprintSkeleton className="aspect-square w-full" />
          <div>
            <BlueprintSkeleton className="h-3 w-40" />
            <BlueprintSkeleton className="mt-3 h-9 w-full" />
            <BlueprintSkeleton className="mt-2 h-9 w-3/4" />
            <BlueprintSkeleton className="mt-5 h-32 w-full" />
            <BlueprintSkeleton className="mt-4 h-[38px] w-full" />
            <BlueprintSkeleton className="mt-3 h-24 w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
