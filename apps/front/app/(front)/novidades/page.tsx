import { ShowcasePage } from "@/components/product/showcase-page";
import { getProducts } from "@/lib/catalog/products";
import { getStoreSettings } from "@/lib/catalog/settings";

export const metadata = { title: "Novidades" };

export default async function NovidadesPage() {
  const [{ docs: products }, settings] = await Promise.all([
    getProducts({ isNew: true, limit: 48 }),
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
