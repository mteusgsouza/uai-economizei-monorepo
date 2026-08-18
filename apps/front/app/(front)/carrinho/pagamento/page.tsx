"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { toast } from "@workspace/ui/components/sonner";
import { RequireAuth } from "@/components/auth/auth-guard";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { CreditCardForm } from "@/components/checkout/credit-card-form";
import { PixInfo } from "@/components/checkout/pix-info";
import { BoletoInfo } from "@/components/checkout/boleto-info";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/lib/cart-context";
import { pixPrice } from "@/lib/commerce";
import { useStoreSettings } from "@/lib/store-settings-context";
import { api } from "@/lib/http-client";
import { Mono } from "@/components/ui/mono";

function PaymentContent() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const settings = useStoreSettings();

  const {
    paymentMethod,
    setPaymentMethod,
    paymentDetails,
    setPaymentDetails,
    shippingCost,
    shippingOption,
    address,
    resetCheckout,
  } = useCheckout();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  if (!address) {
    router.replace("/carrinho/endereco");
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await api.post<{ id: number }[]>("/orders", {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        // O pedido guarda a própria cópia do endereço — daqui para frente ele
        // não muda se o cliente mexer na agenda dele.
        address,
        paymentMethod,
        paymentDetails: JSON.stringify(paymentDetails),
      });

      const orderIds = result.map((o) => o.id).join(",");
      clearCart();
      resetCheckout();
      toast.success("Pedido realizado com sucesso!");
      router.push(`/carrinho/sucesso?orderId=${orderIds}`);
    } catch {
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPix = paymentMethod === "PIX";

  return (
    <CheckoutShell step="pagamento">
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="min-w-0">
          <div className="blueprint p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <h2 className="font-heading text-xl uppercase md:text-[22px]">Entrega</h2>
              <span className="h-px flex-1 bg-divider" />
              <Link
                href="/carrinho/endereco"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:underline"
              >
                Editar
              </Link>
            </div>
            <div className="text-[15px]">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ""} · {address.city} /{" "}
              {address.state} · {address.postalCode}
            </div>
            <Mono as="div" className="mt-2 text-accent-700">
              {shippingOption === "pickup"
                ? "Retirada no balcão"
                : shippingCost === 0
                  ? "Entrega · grátis"
                  : `Entrega · ${formatPrice(shippingCost)}`}
            </Mono>
          </div>

          <div className="blueprint mt-5 p-5">
            <h2 className="mb-4 font-heading text-xl uppercase md:text-[22px]">
              Pagamento
            </h2>

            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              pixTotal={pixTotal}
              pixSaving={subtotal - pixTotal}
            />

            <div className="mt-5">
              {paymentMethod === "CREDIT_CARD" && (
                <CreditCardForm
                  defaultValues={paymentDetails}
                  onChange={setPaymentDetails}
                />
              )}
              {isPix && <PixInfo />}
              {paymentMethod === "BOLETO" && <BoletoInfo />}
            </div>

            <div className="mt-5 flex gap-2">
              <Input placeholder="Cupom de desconto" className="max-w-[220px]" disabled />
              <Button variant="outline" disabled>
                Aplicar
              </Button>
            </div>
            <Mono as="div" className="mt-2 text-ink/45">
              Cupons em breve
            </Mono>

            <div className="mt-6 border-t border-divider pt-5">
              <Button variant="outline" asChild>
                <Link href="/carrinho/endereco">
                  <ArrowLeft className="size-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6">
          <OrderSummary
            showItems
            showShipping
            shippingLabel={shippingOption === "pickup" ? "Retirada no balcão" : "Entrega"}
            shippingCost={shippingCost}
            pixSelected={isPix}
            buttonLabel={
              isSubmitting ? "Processando…" : isPix ? "Pagar com PIX" : "Finalizar pedido"
            }
            onAction={handleSubmit}
          />
        </div>
      </div>
    </CheckoutShell>
  );
}

export default function PaymentPage() {
  return (
    <RequireAuth>
      <PaymentContent />
    </RequireAuth>
  );
}
