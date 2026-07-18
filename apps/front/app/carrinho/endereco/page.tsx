"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RequireAuth } from "@/components/auth/auth-guard";
import { AddressForm } from "@/components/checkout/address-form";
import type { AddressFormValues } from "@/components/checkout/address-form";
import { ShippingOptions } from "@/components/checkout/shipping-options";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/lib/cart-context";

function AddressContent() {
  const router = useRouter();
  const { items } = useCart();
  const {
    address,
    setAddress,
    shippingOption,
    setShippingOption,
    shippingCost,
    setStep,
  } = useCheckout();

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  const handleSubmit = (values: AddressFormValues) => {
    setAddress(values);
    setStep("payment");
    router.push("/carrinho/pagamento");
  };

  const shippingLabels: Record<string, string> = {
    standard: "Frete Standard",
    express: "Frete Expresso",
    pickup: "Retirada na Loja",
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-7 w-7 text-ink" />
            <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Endereco de Entrega
            </h1>
          </div>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            <div className="flex-1">
              <div className="rounded-xl border border-hairline bg-surface p-6">
                <AddressForm
                  defaultValues={address ?? undefined}
                  onSubmit={handleSubmit}
                >
                  <div className="mt-8">
                    <ShippingOptions
                      selected={shippingOption}
                      onSelect={setShippingOption}
                    />
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-hairline pt-6">
                    <Button
                      variant="outline"
                      asChild
                      className="rounded-full"
                    >
                      <Link href="/carrinho">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                      </Link>
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-full bg-ink text-on-dark hover:bg-charcoal"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </AddressForm>
              </div>
            </div>

            <div className="w-full lg:w-80">
              <div className="lg:sticky lg:top-24">
                <OrderSummary
                  showShipping
                  shippingLabel={shippingLabels[shippingOption]}
                  shippingCost={shippingCost}
                  buttonLabel=""
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function AddressPage() {
  return (
    <RequireAuth>
      <AddressContent />
    </RequireAuth>
  );
}
