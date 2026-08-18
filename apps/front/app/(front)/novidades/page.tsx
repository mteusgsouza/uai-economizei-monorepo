import { ShowcasePage } from "@/components/product/showcase-page";
import { getProducts } from "@/lib/catalog/products";
import { getStoreSettings } from "@/lib/catalog/settings";

export const metadata = { title: "Novidades" };

export default async function NovidadesPage() {
  const [{ docs: products }, settings] = await Promise.all([
    // As últimas entradas do catálogo — a ordenação padrão de `getProducts` já é
    // `-createdAt`. Antes filtrava por `isNew`, que guarda o estado de
    // conservação (novo/usado) e traria quase o catálogo inteiro.
    getProducts({ limit: 48 }),
    getStoreSettings(),
  ]);

  return (
    <ShowcasePage
      title="Novidades"
      crumb="Novidades"
      products={products}
      settings={settings}
      emptyDescription="Nenhuma entrada recente no catálogo."
    />
  );
}
