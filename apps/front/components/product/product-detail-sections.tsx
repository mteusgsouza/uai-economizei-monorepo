import { ProductImage } from "@/components/ui/product-image";
import type { ProductRichDescription } from "@/lib/catalog/descriptions";
import type { Product } from "@/types/product";

export function ProductDescriptionSections({
  product,
  richDescription,
}: {
  product: Product;
  richDescription: ProductRichDescription | null;
}) {
  return (
    <>
      {product.description_html && (
        <section className="mt-12">
          <h2 className="font-heading text-xl font-semibold text-ink mb-4">Descrição</h2>
          <div
            className="prose prose-base max-w-none leading-relaxed text-steel"
            dangerouslySetInnerHTML={{ __html: product.description_html }}
          />
        </section>
      )}

      {richDescription?.description_html && (
        <section className="mt-8">
          <div
            className="prose prose-base max-w-none leading-relaxed text-steel"
            dangerouslySetInnerHTML={{ __html: richDescription.description_html }}
          />
        </section>
      )}

      {richDescription && Object.keys(richDescription.specs).length > 0 && (
        <section className="mt-10">
          <h3 className="font-heading text-lg font-semibold text-ink mb-3">
            Especificações
          </h3>
          <dl className="max-w-2xl divide-y divide-hairline border-y border-hairline">
            {Object.entries(richDescription.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 text-sm">
                <dt className="text-steel">{key}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  if (product.productImages.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-heading text-lg font-semibold text-ink mb-4">Galeria</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {product.productImages.map((img, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-hairline bg-surface aspect-square"
          >
            <ProductImage
              src={img.url}
              alt={img.name || `${product.name} - imagem ${i + 1}`}
              aspectRatio="1/1"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
