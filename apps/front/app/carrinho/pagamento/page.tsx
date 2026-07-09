"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RequireAuth } from "@/components/auth-guard";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { CreditCardForm } from "@/components/credit-card-form";
import { PixInfo } from "@/components/pix-info";
import { BoletoInfo } from "@/components/boleto-info";
import { OrderSummary } from "@/components/order-summary";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/use-auth";
import { api } from "@/lib/http-client";
import { toast } from "sonner";

function PaymentContent() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
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

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  if (!address) {
    router.replace("/carrinho/endereco");
    return null;
  }

  const shippingLabels: Record<string, string> = {
    standard: "Frete Standard",
    express: "Frete Expresso",
    pickup: "Retirada na Loja",
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const result = await api.post<{ id: number }[]>("/orders", {
        items: orderItems,
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

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-ink" />
            <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Pagamento
            </h1>
          </div>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            <div className="flex-1">
              <div className="rounded-xl border border-hairline bg-surface p-6">
                <div className="mb-6">
                  <PaymentMethodSelector
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                </div>

                <div className="mt-6 rounded-lg border border-hairline bg-canvas p-6">
                  {paymentMethod === "CREDIT_CARD" && (
                    <CreditCardForm
                      defaultValues={paymentDetails}
                      onChange={setPaymentDetails}
                    />
                  )}
                  {paymentMethod === "PIX" && <PixInfo />}
                  {paymentMethod === "BOLETO" && <BoletoInfo />}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-hairline pt-6">
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href="/carrinho/endereco">
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Link>
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[200px] rounded-full bg-ink text-on-dark hover:bg-charcoal"
                    size="lg"
                  >
                    {isSubmitting ? "Processando..." : "Finalizar Pedido"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80">
              <div className="lg:sticky lg:top-24 space-y-4">
                <OrderSummary
                  showShipping
                  shippingLabel={shippingLabels[shippingOption]}
                  shippingCost={shippingCost}
                  buttonLabel=""
                />

                <div className="rounded-xl border border-hairline bg-surface p-4">
                  <h4 className="text-sm font-medium text-ink">Endereco de entrega</h4>
                  <div className="mt-2 text-sm text-steel space-y-0.5">
                    <p>{address.street}, {address.number}</p>
                    {address.complement && <p>{address.complement}</p>}
                    <p>{address.neighborhood}</p>
                    <p>{address.city} - {address.state}</p>
                    <p>CEP: {address.postalCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <RequireAuth>
      <PaymentContent />
    </RequireAuth>
  );
}
