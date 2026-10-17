import type { SpecGroup } from "@/lib/specs/types";
import type { Product } from "@/types/product";
import { SpecSheet } from "./spec-sheet";

/**
 * Descrição e ficha técnica lado a lado. A ficha só aparece quando há
 * especificação cadastrada — sem dado estruturado, uma tabela vazia diz menos
 * que a ausência dela.
 */
export function ProductDescriptionSections({
  product,
  specSheet,
}: {
  product: Product;
  specSheet: SpecGroup[];
}) {
  const html = product.description_html || "";
  const hasSpecs = specSheet.length > 0;

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

      {hasSpecs && <SpecSheet groups={specSheet} />}
    </div>
  );
}
