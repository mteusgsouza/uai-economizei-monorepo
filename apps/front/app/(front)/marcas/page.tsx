import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { getBrands } from "@/lib/catalog/taxonomy";
import { getProducts } from "@/lib/catalog/products";

export const metadata = { title: "Marcas" };

export default async function MarcasPage() {
  const [brands, { docs: products }] = await Promise.all([
    getBrands(),
    getProducts({ limit: 200 }),
  ]);

  const counted = brands
    .map((brand) => ({
      brand,
      count: products.filter((p) => p.brand?.id === brand.id).length,
    }))
    .sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name));

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-7 md:px-10 md:pb-[72px]">
      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        <span className="text-ink"> / Marcas</span>
      </Mono>

      <div className="mt-3 border-b border-divider pb-4">
        <h1 className="font-heading text-[32px] uppercase leading-none md:text-[44px]">
          Fornecedores
        </h1>
        <Mono as="div" className="mt-1 text-ink/55">
          {brands.length} {brands.length === 1 ? "marca" : "marcas"} no catálogo
        </Mono>
      </div>

      {counted.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            title="Nada por aqui"
            description="Nenhuma marca cadastrada ainda."
            actionLabel="Ver catálogo"
            actionHref="/produtos"
          />
        </div>
      ) : (
        <div className="cgroup mt-7 grid grid-cols-2 border border-divider sm:grid-cols-3 lg:grid-cols-4">
          {counted.map(({ brand, count }) => (
            <Link
              key={brand.id}
              href={`/produtos?marca=${encodeURIComponent(brand.name)}`}
              // Fios só à direita e embaixo; a moldura externa fecha a grade.
              className="ccell block border-b border-r border-divider p-5 text-center text-inherit"
            >
              <div className="font-heading text-lg uppercase tracking-[0.08em] text-ink/70">
                {brand.name}
              </div>
              <Mono as="div" className="mt-1 text-ink/45">
                {count} {count === 1 ? "produto" : "produtos"}
              </Mono>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
