"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/lib/cart-context";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TYPE_OF_WORK_LABELS, GENRE_LABELS } from "@/types/product";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const typeLabel = product?.type_of_work ? TYPE_OF_WORK_LABELS[product.type_of_work] : null;
  const genreLabel = product?.genre ? GENRE_LABELS[product.genre] : product?.genre;

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

        {isLoading && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        )}

        {isError && (
          <div className="mt-16 text-center">
            <p className="text-steel">
              Erro ao carregar produto: {(error as Error).message}
            </p>
          </div>
        )}

        {product && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {typeLabel && (
                  <Badge variant="secondary">{typeLabel}</Badge>
                )}
                {genreLabel && (
                  <Badge variant="outline">{genreLabel}</Badge>
                )}
              </div>

              <h1 className="mt-4 font-heading text-3xl md:text-4xl font-semibold leading-tight text-ink">
                {product.name}
              </h1>

              {product.authors.length > 0 && (
                <p className="mt-2 text-steel">{product.authors.join(", ")}</p>
              )}

              <p className="mt-6 text-3xl font-semibold text-ink">
                {product.price}
              </p>

              <div className="mt-8 space-y-4 rounded-lg border border-hairline p-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-steel">Quantidade</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium text-ink">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full gap-2"
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

              {product.description && (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-ink">
                    Descricao
                  </h2>
                  <div
                    className="mt-2 leading-relaxed text-steel"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              <div className="mt-8 space-y-2 text-sm text-steel">
                {product.publisher && (
                  <p>
                    Editora: {product.publisher.name}
                  </p>
                )}
                {product.publication_date && (
                  <p>
                    Publicacao: {new Date(product.publication_date).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {product.label && (
                  <p>Selo: {product.label}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
