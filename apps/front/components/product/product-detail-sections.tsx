import type { ProductRichDescription } from "@/lib/catalog/descriptions";
import type { Product } from "@/types/product";
import { Mono } from "@/components/ui/mono";

/**
 * Descrição e ficha técnica lado a lado. A ficha só aparece quando há
 * especificação cadastrada — sem dado estruturado, uma tabela vazia diz menos
 * que a ausência dela.
 */
export function ProductDescriptionSections({
  product,
  richDescription,
}: {
  product: Product;
  richDescription: ProductRichDescription | null;
}) {
  const html = product.description_html || richDescription?.description_html || "";
  const specs = richDescription?.specs ?? {};
  const hasSpecs = Object.keys(specs).length > 0;

  if (!html && !hasSpecs) return null;

  return (
    <div className="mt-11 grid gap-10 lg:grid-cols-[1fr_460px]">
      {html && (
        <section>
          <h2 className="font-heading text-[22px] uppercase md:text-[26px]">Descrição</h2>
          <div
            className="prose prose-sm mt-3 max-w-[640px] text-ink/75 prose-headings:font-heading prose-headings:uppercase prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      )}

      {hasSpecs && (
        <section>
          <h2 className="font-heading text-[22px] uppercase md:text-[26px]">
            Ficha técnica
          </h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {Object.entries(specs).map(([key, value]) => (
                <tr key={key} className="border-b border-divider/60">
                  <td className="py-1.5 pr-4 align-top">
                    <Mono className="text-ink/55">{key}</Mono>
                  </td>
                  <td className="py-1.5">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
