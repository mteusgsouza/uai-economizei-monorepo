"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format-price";

interface OrderSummaryProps {
  shippingLabel?: string;
  shippingCost?: number;
  showShipping?: boolean;
  checkoutHref?: string;
  buttonLabel?: string;
  onAction?: () => void;
}

export function OrderSummary({
  shippingLabel,
  shippingCost = 0,
  showShipping = false,
  checkoutHref = "/carrinho/endereco",
  buttonLabel = "Finalizar Compra",
  onAction,
}: OrderSummaryProps) {
  const router = useRouter();
  const { items } = useCart();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.value * item.quantity, 0),
    [items],
  );

  const total = subtotal + shippingCost;

  const handleClick = () => {
    if (onAction) {
      onAction();
    } else {
      router.push(checkoutHref);
    }
  };

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="font-heading text-lg font-semibold text-ink">
        Resumo do Pedido
      </h2>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-steel">
            Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})
          </span>
          <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
        </div>

        {showShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-steel">{shippingLabel ?? "Frete"}</span>
            <span className="font-medium text-ink">
              {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
            </span>
          </div>
        )}

        {!showShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-steel">Frete</span>
            <span className="text-sm text-steel">Calculado na proxima etapa</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-base font-semibold">
        <span className="text-ink">Total</span>
        <span className="text-ink">{formatPrice(total)}</span>
      </div>

      <Button
        className="mt-6 w-full rounded-full bg-ink text-on-dark hover:bg-charcoal"
        size="lg"
        onClick={handleClick}
        disabled={items.length === 0}
      >
        {buttonLabel}
      </Button>

      {!onAction && (
        <p className="mt-3 text-center text-xs text-stone">
          O pagamento sera processado na proxima etapa.
        </p>
      )}
    </div>
  );
}
