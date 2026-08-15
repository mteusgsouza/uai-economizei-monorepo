"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import { useCart } from "@/lib/cart-context";
import { installment, pixPrice, type StoreSettings } from "@/lib/commerce";
import { Mono } from "@/components/ui/mono";
import { Tag } from "@/components/ui/tag";
import { CartDrawerItem } from "./cart-drawer-item";
import { FreeShippingBar } from "./free-shipping-bar";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: StoreSettings;
}

/** O carrinho lateral: itens, progresso de frete e o fechamento da conta. */
export function CartDrawer({ open, onOpenChange, settings }: CartDrawerProps) {
  const router = useRouter();
  const { items, updateQuantity, itemCount } = useCart();

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

  function goToCheckout() {
    onOpenChange(false);
    router.push("/carrinho");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // O `!` é necessário: o SheetContent traz `data-[side=right]:sm:max-w-sm`,
        // e o seletor de atributo tem especificidade maior que uma classe só.
        className="flex w-full flex-col gap-0 border-l border-divider bg-canvas p-0 sm:max-w-[440px]!"
      >
        <div className="flex items-center gap-3 border-b border-divider p-5">
          <SheetTitle className="font-heading text-2xl uppercase">Seu carrinho</SheetTitle>
          {itemCount > 0 && (
            <Tag>
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </Tag>
          )}
          <Button
            variant="outline"
            size="icon"
            className="ml-auto"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar carrinho"
          >
            <X className="size-4" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="blueprint p-6 text-center">
              <div className="font-heading text-xl uppercase">Carrinho vazio</div>
              <p className="mt-1.5 mb-3.5 text-[13px] text-ink/60">
                Os produtos que você adicionar aparecem aqui.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Continuar comprando
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-divider px-5 py-3.5">
              <FreeShippingBar subtotal={subtotal} settings={settings} />
            </div>

            <div className="flex-1 overflow-auto px-5">
              {items.map((item) => (
                <CartDrawerItem
                  key={item.product.id}
                  item={item}
                  pixDiscountPercent={settings.pixDiscountPercent}
                  onQuantityChange={(quantity) => updateQuantity(item.product.id, quantity)}
                />
              ))}
            </div>

            <div className="border-t border-divider p-5">
              <div className="mb-1 flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Frete</span>
                <Mono className="text-accent-700">calculado no checkout</Mono>
              </div>
              {pixSaving > 0 && (
                <div className="mb-2.5 flex justify-between text-sm text-accent-700">
                  <span>Desconto PIX ({settings.pixDiscountPercent}%)</span>
                  <span>− {formatPrice(pixSaving)}</span>
                </div>
              )}

              <div className="flex items-baseline justify-between border-t border-divider pt-3">
                <span className="font-heading text-xl uppercase">Total</span>
                <div className="text-right">
                  <div className="font-heading text-[28px] leading-none">
                    {formatPrice(pixSaving > 0 ? pixTotal : subtotal)}
                  </div>
                  <Mono as="div" className="text-ink/55">
                    ou {settings.maxInstallments}x{" "}
                    {formatPrice(installment(subtotal, settings.maxInstallments))}
                  </Mono>
                </div>
              </div>

              <Button className="mt-3.5 w-full py-3" onClick={goToCheckout}>
                Finalizar compra
              </Button>
              <Button
                variant="ghost"
                className="mt-1.5 w-full"
                onClick={() => onOpenChange(false)}
              >
                Continuar comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
