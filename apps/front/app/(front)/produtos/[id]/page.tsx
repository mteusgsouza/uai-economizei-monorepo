import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductPaymentTable } from "@/components/product/payment-table";
import { ProductDescriptionSections } from "@/components/product/product-detail-sections";
import { ProductCard } from "@/components/product/product-card";
import { ProductShelf } from "@/components/product/product-shelf";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { JsonLd } from "@/components/seo/json-ld";
import { Mono } from "@/components/ui/mono";
import { getProduct, getProducts } from "@/lib/catalog/products";
import { getProductSpecSheet } from "@/lib/catalog/specs";
import { getStoreSettings } from "@/lib/catalog/settings";
import { productJsonLd, productMetadata } from "@/lib/seo/product";

type Args = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return { title: "Produto não encontrado" };
  return productMetadata(product);
}

export default async function ProductDetailPage({ params }: Args) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [product, specSheet, settings] = await Promise.all([
    getProduct(productId),
    getProductSpecSheet(productId),
    getStoreSettings(),
  ]);
  if (!product) notFound();

  // "Quem viu, levou também": vizinhos da mesma categoria, sem repetir o atual.
  const related = product.category
    ? (await getProducts({ categorySlug: product.category.categorySlug, limit: 5 })).docs
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6 md:px-10 md:pb-[72px]">
      <JsonLd data={productJsonLd(product)} />

      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/produtos?categoria=${product.category.categorySlug}`}
              className="hover:text-accent-700"
            >
              {product.category.title}
            </Link>
          </>
        )}
        <span className="text-ink"> / {product.name}</span>
      </Mono>

      <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_400px]">
        <ProductGallery product={product} />
        <div>
          <ProductPurchasePanel product={product} settings={settings} />
          <ProductPaymentTable product={product} settings={settings} />
        </div>
      </div>

      <ProductDescriptionSections product={product} specSheet={specSheet} />

      {related.length > 0 && (
        <ProductShelf
          title="Quem viu, levou também"
          action={
            <Link
              href={`/produtos?categoria=${product.category?.categorySlug ?? ""}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Ver mais
              <ArrowRight className="size-[15px]" />
            </Link>
          }
        >
          {related.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              pixDiscountPercent={settings.pixDiscountPercent}
              maxInstallments={settings.maxInstallments}
            />
          ))}
        </ProductShelf>
      )}

      <RecentlyViewed productId={product.id} />
    </div>
  );
}
