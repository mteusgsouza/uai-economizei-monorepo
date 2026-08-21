"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { RequireAuth } from "@/components/auth/auth-guard";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CouponRow } from "@/components/checkout/coupon-row";
import { DeliveryRecap } from "@/components/checkout/delivery-recap";
import { PaymentBlock } from "@/components/checkout/payment-block";
import { QuoteBlock } from "@/components/checkout/quote-block";
import { useOrderSubmit } from "@/components/checkout/use-order-submit";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/lib/cart-context";
import { pixPrice } from "@/lib/commerce";
import { useStoreSettings } from "@/lib/store-settings-context";

function PaymentContent() {
  const router = useRouter();
  const { items } = useCart();
  const settings = useStoreSettings();

  const {
    paymentMethod,
    setPaymentMethod,
    paymentDetails,
    setPaymentDetails,
    shippingCost,
    shippingOption,
    address,
  } = useCheckout();

  // A loja desligou o pagamento pelo site: o pedido vira orçamento e este passo
  // deixa de pedir dado nenhum.
  const quoteMode = !settings.onlinePayment.enabled;
  const { submit, isSubmitting, isDone } = useOrderSubmit(quoteMode);

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

  // Enviado o pedido, esta página está só de saída. Limpar o carrinho e o
  // checkout reabre os dois guards abaixo — o do carrinho vazio e o do
  // endereço ausente —, e qualquer um deles atropelaria a navegação para a
  // confirmação. Sair antes é o que mantém o destino.
  if (isDone) return null;

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  const pickup = shippingOption === "pickup";

  // Entrega sem endereço é passo incompleto; retirada não precisa de nenhum.
  if (!address && !pickup) {
    router.replace("/carrinho/endereco");
    return null;
  }

  const isPix = !quoteMode && paymentMethod === "PIX";

  return (
    <CheckoutShell step="pagamento">
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="min-w-0">
          <DeliveryRecap pickup={pickup} address={address} shippingCost={shippingCost} />

          <div className="blueprint mt-5 p-5">
            {quoteMode ? (
              <QuoteBlock notice={settings.onlinePayment.offlineNotice} />
            ) : (
              <PaymentBlock
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                details={paymentDetails}
                onDetailsChange={setPaymentDetails}
                pixTotal={pixTotal}
                pixSaving={subtotal - pixTotal}
              />
            )}

            <CouponRow />

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
            shippingLabel={pickup ? "Retirada no balcão" : "Entrega"}
            shippingCost={shippingCost}
            pixSelected={isPix}
            buttonLabel={
              isSubmitting
                ? "Processando…"
                : quoteMode
                  ? "Enviar pedido"
                  : isPix
                    ? "Pagar com PIX"
                    : "Finalizar pedido"
            }
            onAction={submit}
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
