"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Check, Package } from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useProductDescription } from "@/hooks/use-product-description";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductImage } from "@/components/ui/product-image";
import { QuantitySelector } from "@/components/ui/quantity-selector";
function ProductDetailSkeleton() {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { data: richDescription } = useProductDescription(id);
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-8 py-12">
        <Link
          href="/"
          className="text-sm text-steel hover:text-ink transition-colors"
        >
          &larr; Voltar
        </Link>

        {isLoading && <ProductDetailSkeleton />}

        {isError && (
          <div className="mt-16 text-center">
            <p className="text-steel">
              Erro ao carregar produto: {(error as Error).message}
            </p>
          </div>
        )}

        {product && (
          <>
            {/* ── Topo: grid 2-col (imagem + info) ── */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                <ProductImage src={product.productMainImg} alt={product.name} />
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {product.category && (
                    <Badge variant="secondary">{product.category.title}</Badge>
                  )}
                  {product.brand && (
                    <Badge variant="outline">{product.brand.name}</Badge>
                  )}
                  {product.isNew === "true" && (
                    <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">
                      Novidade
                    </Badge>
                  )}
                </div>

                <h1 className="mt-4 font-heading text-3xl md:text-4xl font-semibold leading-tight text-ink">
                  {product.name}
                </h1>

                {product.brand && (
                  <p className="mt-2 text-steel">{product.brand.name}</p>
                )}

                <div className="mt-6 flex items-baseline gap-3">
                  <p className="text-3xl font-semibold text-ink">
                    {formatPrice(product.value)}
                  </p>
                </div>

                <div className="mt-8 space-y-4 rounded-lg border border-hairline p-6">
                  <div className="flex items-center gap-2 text-sm text-steel">
                    <Package className="h-4 w-4" />
                    {product.stock > 0 ? (
                      <span>{product.stock} unidades disponiveis</span>
                    ) : (
                      <span className="text-brand-error">Fora de estoque</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-steel">Quantidade</span>
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={product.stock}
                    />
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full gap-2"
                    disabled={product.stock === 0}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-4 w-4" />
                        Adicionado!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Adicionar ao carrinho
                      </>
                    )}
                  </Button>
                </div>

                {product.createdAt && (
                  <p className="mt-4 text-xs text-stone">
                    Adicionado em {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            </div>

            {/* ── Descrição (full-width, usa description_html do Payload) ── */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {((product as any).description_html || (product as any).description) && (
              <section className="mt-12">
                <h2 className="font-heading text-xl font-semibold text-ink mb-4">
                  Descrição
                </h2>
                <div
                  className="prose prose-base max-w-none leading-relaxed text-steel"
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  dangerouslySetInnerHTML={{ __html: (product as any).description_html || (product as any).description }}
                />
              </section>
            )}

            {/* ── Descrição rica do Payload CMS (product-descriptions) ── */}
            {richDescription?.description_html && (
              <section className="mt-8">
                <div
                  className="prose prose-base max-w-none leading-relaxed text-steel"
                  dangerouslySetInnerHTML={{ __html: richDescription.description_html }}
                />
              </section>
            )}

            {/* ── Especificações técnicas ── */}
            {richDescription?.specs && Object.keys(richDescription.specs).length > 0 && (
              <section className="mt-10">
                <h3 className="font-heading text-lg font-semibold text-ink mb-3">
                  Especificações
                </h3>
                <dl className="max-w-2xl divide-y divide-hairline border-y border-hairline">
                  {Object.entries(richDescription.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 text-sm">
                      <dt className="text-steel">{key}</dt>
                      <dd className="font-medium text-ink">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* ── Galeria de imagens (full-width, grid 4-col) ── */}
            {product.productImages && product.productImages.length > 0 && (
              <section className="mt-10">
                <h2 className="font-heading text-lg font-semibold text-ink mb-4">Galeria</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.productImages.map((img: { url: string; name: string }, i: number) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-hairline bg-surface aspect-square">
                      <ProductImage
                        src={img.url}
                        alt={img.name || `${product.name} - imagem ${i + 1}`}
                        aspectRatio="1/1"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
