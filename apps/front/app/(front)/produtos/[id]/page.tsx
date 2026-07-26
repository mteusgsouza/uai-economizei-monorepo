import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@workspace/ui/components/badge";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductImage } from "@/components/ui/product-image";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import {
  ProductDescriptionSections,
  ProductGallery,
} from "@/components/product/product-detail-sections";
import { getProduct } from "@/lib/catalog/products";
import { getProductDescription } from "@/lib/catalog/descriptions";

type Args = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return { title: "Produto não encontrado" };
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: Args) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [product, richDescription] = await Promise.all([
    getProduct(productId),
    getProductDescription(id),
  ]);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-8 py-12">
        <Link href="/" className="text-sm text-steel hover:text-ink transition-colors">
          &larr; Voltar
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
            <ProductImage src={product.productMainImg} alt={product.name} priority />
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <Badge variant="secondary">{product.category.title}</Badge>
              )}
              {product.brand && <Badge variant="outline">{product.brand.name}</Badge>}
              {product.isNew === "true" && (
                <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">
                  Novidade
                </Badge>
              )}
            </div>

            <h1 className="mt-4 font-heading text-3xl md:text-4xl font-semibold leading-tight text-ink">
              {product.name}
            </h1>

            {product.brand && <p className="mt-2 text-steel">{product.brand.name}</p>}

            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-semibold text-ink">
                {formatPrice(product.value)}
              </p>
            </div>

            <ProductPurchasePanel product={product} />

            {product.createdAt && (
              <p className="mt-4 text-xs text-stone">
                Adicionado em {new Date(product.createdAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        <ProductDescriptionSections product={product} richDescription={richDescription} />
        <ProductGallery product={product} />
      </main>
      <SiteFooter />
    </div>
  );
}
