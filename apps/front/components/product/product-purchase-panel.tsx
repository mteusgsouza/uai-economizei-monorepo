"use client";

import { useState } from "react";
import { Check, Heart } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { cn } from "@workspace/ui/lib/utils";
import type { Product } from "@/types/product";
import type { StoreSettings } from "@/lib/commerce";
import { cardPlans, discountLabel, installment, pixPrice } from "@/lib/commerce";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { Mono } from "@/components/ui/mono";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Tag } from "@/components/ui/tag";
import { ShippingEstimate } from "./shipping-estimate";

/**
 * A coluna de compra: identificação, o bloco de preço como ficha técnica
 * (cheio riscado, preço, à vista no PIX, parcela) e as ações. O desconto é um
 * dado entre os outros, não um adesivo.
 */
export function ProductPurchasePanel({
  product,
  settings,
}: {
  product: Product;
  settings: StoreSettings;
}) {
  const { addItem } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const badge = discountLabel(product.discountPercent);
  const showPix = product.pixDiscount && settings.pixDiscountPercent > 0;
  const outOfStock = product.stock <= 0;

  const identity = [product.category?.title, product.brand?.name, `SKU ${product.id}`]
    .filter(Boolean)
    .join(" · ");

  // A parcela anunciada aqui é a última linha da tabela de formas de pagamento,
  // com a taxa do cartão. Sem taxa cadastrada, divide o preço à vista como antes
  // — o que não pode é o painel prometer um valor e a tabela abaixo mostrar outro.
  const plans = cardPlans(product.value, settings.cardFees?.rates ?? []);
  const longest = plans.length > 0 ? plans[plans.length - 1] : null;
  const maxParcels = longest?.installments ?? settings.maxInstallments;
  const parcelValue =
    longest?.perInstallment ?? installment(product.value, settings.maxInstallments);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <Mono as="div" className="text-ink/50">
        {identity}
      </Mono>

      <h1 className="mt-2 font-heading text-[28px] uppercase leading-[1.02] md:text-[38px]">
        {product.name}
      </h1>

      {!product.isNew && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag variant="neutral">Produto usado</Tag>
        </div>
      )}

      <div className="blueprint mt-4 p-4">
        {product.listPrice !== null && (
          <div className="text-[13px] text-ink/45 line-through">
            {formatPrice(product.listPrice)}
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-2.5">
          <div className="font-heading text-[36px] leading-none md:text-[44px]">
            {formatPrice(product.value)}
          </div>
          {badge && <Tag>{badge}</Tag>}
        </div>

        {showPix && (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-divider pt-3">
            <Mono className="text-accent-700">
              {formatPrice(pixPrice(product.value, settings.pixDiscountPercent))} no PIX
            </Mono>
            <Mono className="text-ink/50">
              {settings.pixDiscountPercent}% off à vista
            </Mono>
          </div>
        )}
        <Mono as="div" className="mt-1.5 text-ink/55">
          ou em até {maxParcels}x de {formatPrice(parcelValue)} no cartão
        </Mono>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={product.stock || 1}
          size="lg"
        />
        <Button className="flex-1" onClick={handleAdd} disabled={outOfStock}>
          {added ? (
            <>
              <Check className="size-4" />
              Adicionado
            </>
          ) : outOfStock ? (
            "Indisponível"
          ) : (
            "Adicionar ao carrinho"
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => toggle(product.id)}
          aria-label={inWishlist ? "Remover dos favoritos" : "Salvar nos favoritos"}
          className={cn(inWishlist && "text-primary")}
        >
          <Heart className="size-[17px]" fill={inWishlist ? "currentColor" : "none"} />
        </Button>
      </div>

      <Mono as="div" className="mt-2 text-ink/50">
        {outOfStock
          ? "Sem estoque no momento"
          : `${product.stock} ${product.stock === 1 ? "unidade disponível" : "unidades disponíveis"}`}
      </Mono>

      <ShippingEstimate settings={settings} subtotal={product.value * quantity} />
    </div>
  );
}
