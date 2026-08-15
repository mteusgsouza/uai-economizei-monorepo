import { ShowcasePage } from "@/components/product/showcase-page";
import { getProducts } from "@/lib/catalog/products";
import { getStoreSettings } from "@/lib/catalog/settings";

export const metadata = { title: "Mais vendidos" };

export default async function MaisVendidosPage() {
  // Sem histórico de vendas no catálogo, "mais vendidos" é o que a loja
  // destaca: os produtos com maior desconto no ar.
  const [{ docs: products }, settings] = await Promise.all([
    getProducts({ sortBy: "discount", sortOrder: "desc", limit: 48 }),
    getStoreSettings(),
  ]);

  return (
    <ShowcasePage
      title="Mais vendidos"
      crumb="Mais vendidos"
      products={products}
      settings={settings}
      emptyDescription="Nenhum produto em destaque no momento."
    />
  );
}
