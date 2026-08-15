"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/use-auth";
import { withRedirect } from "@/lib/auth-redirect";
import { installment, pixPrice } from "@/lib/commerce";
import { useStoreSettings } from "@/lib/store-settings-context";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";

interface OrderSummaryProps {
  shippingLabel?: string;
  shippingCost?: number;
  showShipping?: boolean;
  /** Frete ainda não calculado — evita exibir R$ 0,00 como se fosse grátis. */
  shippingPending?: boolean;
  checkoutHref?: string;
  buttonLabel?: string;
  showAction?: boolean;
  onAction?: () => void;
  /** Lista os itens no topo, como no resumo do checkout. */
  showItems?: boolean;
  /** Cobra pelo preço à vista — o total muda quando o PIX está escolhido. */
  pixSelected?: boolean;
}

/**
 * O fechamento da conta: subtotal, frete, desconto à vista e total com a
 * parcela embaixo. O desconto do PIX só entra no total quando o PIX é o
 * método escolhido; fora disso aparece como economia possível.
 */
export function OrderSummary({
  shippingLabel,
  shippingCost = 0,
  showShipping = false,
  shippingPending = false,
  checkoutHref = "/carrinho/endereco",
  buttonLabel = "Finalizar compra",
  showAction = true,
  onAction,
  showItems = false,
  pixSelected = false,
}: OrderSummaryProps) {
  const router = useRouter();
  const { items } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const settings = useStoreSettings();

  const needsLogin = !onAction && !isAuthenticated;

  const { subtotal, pixTotal } = useMemo(
    () =>
      items.reduce(
        (acc, { product, quantity }) => {
          const line = product.value * quantity;
          acc.subtotal += line;
          acc.pixTotal += product.pixDiscount
            ? pixPrice(line, settings.pixDiscountPercent)
            : line;
          return acc;
        },
        { subtotal: 0, pixTotal: 0 },
      ),
    [items, settings.pixDiscountPercent],
  );

  const pixSaving = subtotal - pixTotal;
  const goods = pixSelected ? pixTotal : subtotal;
  const total = goods + shippingCost;

  const handleClick = () => {
    if (onAction) onAction();
    else router.push(checkoutHref);
  };

  return (
    <div className="blueprint p-5">
      <h2 className="font-heading text-xl uppercase md:text-[22px]">Resumo</h2>

      {showItems && (
        <div className="mt-3.5">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-3 border-t border-divider py-3 last:border-b"
            >
              <div className="blueprint duotone size-14 flex-none">
                <ProductImage
                  src={product.productMainImg}
                  alt={product.name}
                  aspectRatio="1/1"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 font-heading text-[15px] leading-tight">
                  {product.name}
                </div>
                <Mono as="div" className="text-ink/50">
                  {quantity} un
                </Mono>
              </div>
              <div className="font-heading text-base">
                {formatPrice(product.value * quantity)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex justify-between text-sm">
        <span>
          Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})
        </span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className="mt-1 flex justify-between text-sm">
        <span>{showShipping ? (shippingLabel ?? "Frete") : "Frete"}</span>
        {showShipping ? (
          shippingPending ? (
            <Mono className="text-ink/55">informe o CEP</Mono>
          ) : shippingCost === 0 ? (
            <Mono className="text-accent-700">grátis</Mono>
          ) : (
            <span>{formatPrice(shippingCost)}</span>
          )
        ) : (
          <Mono className="text-accent-700">calculado no checkout</Mono>
        )}
      </div>

      {pixSaving > 0 && (
        <div className="mt-1 flex justify-between text-sm text-accent-700">
          <span>
            {pixSelected ? "Desconto PIX" : "Pagando no PIX"} (
            {settings.pixDiscountPercent}%)
          </span>
          <span>− {formatPrice(pixSaving)}</span>
        </div>
      )}

      <div className="mt-3 flex items-baseline justify-between border-t border-divider pt-3">
        <span className="font-heading text-xl uppercase">Total</span>
        <div className="text-right">
          <div className="font-heading text-[26px] leading-none md:text-[30px]">
            {formatPrice(total)}
          </div>
          <Mono as="div" className="text-ink/55">
            ou {settings.maxInstallments}x{" "}
            {formatPrice(installment(subtotal + shippingCost, settings.maxInstallments))}
          </Mono>
        </div>
      </div>

      {showAction &&
        (needsLogin ? (
          <>
            <Button
              className="mt-4 w-full py-3"
              disabled={items.length === 0 || isAuthLoading}
              onClick={() => router.push(withRedirect("/login", checkoutHref))}
            >
              {isAuthLoading ? buttonLabel : "Entrar para finalizar"}
            </Button>
            <Mono as="p" className="mt-2.5 block text-center text-ink/50">
              Sem conta?{" "}
              <Link
                href={withRedirect("/register", checkoutHref)}
                className="text-primary hover:underline"
              >
                Cadastre-se
              </Link>
            </Mono>
          </>
        ) : (
          <>
            <Button
              className="mt-4 w-full py-3"
              onClick={handleClick}
              disabled={items.length === 0}
            >
              {buttonLabel}
            </Button>
            {!onAction && (
              <Mono as="p" className="mt-2.5 block text-center text-ink/50">
                Você revisa o pedido antes de confirmar
              </Mono>
            )}
          </>
        ))}
    </div>
  );
}
