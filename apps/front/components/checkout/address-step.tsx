"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { AddressForm } from "@/components/checkout/address-form";
import type { AddressFormValues } from "@/components/checkout/address-form";
import { PickupBlock } from "@/components/checkout/pickup-block";
import { ShippingOptions } from "@/components/checkout/shipping-options";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCheckout } from "@/lib/checkout-context";
import { useShippingQuote } from "@/hooks/use-shipping-quote";

/**
 * O passo de entrega: primeiro como o pedido chega — entrega ou retirada —, e só
 * então o que preencher. Quem retira na loja não tem endereço de entrega.
 */
export function AddressStep({ initialValues }: { initialValues?: Partial<AddressFormValues> }) {
  const router = useRouter();
  const {
    setAddress,
    shippingOption,
    setShippingOption,
    shippingCost,
    setDeliveryQuote,
    setStep,
  } = useCheckout();

  const [cep, setCep] = useState(initialValues?.postalCode ?? "");
  const quote = useShippingQuote(cep);
  const pickup = shippingOption === "pickup";

  // O valor da faixa alimenta o total; sem CEP atendido não há frete de entrega
  useEffect(() => {
    setDeliveryQuote(quote.status === "available" ? quote.value : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setDeliveryQuote é estável o bastante
  }, [quote]);

  // Fora da área de entrega, a única opção possível é a retirada
  useEffect(() => {
    if (quote.status === "unavailable" && shippingOption === "delivery") {
      setShippingOption("pickup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.status]);

  const goToPayment = () => {
    setStep("payment");
    router.push("/carrinho/pagamento");
  };

  const handleSubmit = (values: AddressFormValues) => {
    setAddress(values);
    goToPayment();
  };

  const handlePickup = () => {
    // Retirada não tem entrega: o pedido nasce sem endereço, e é isso que
    // distingue retirada de entrega no banco e no filtro do dashboard.
    setAddress(null);
    goToPayment();
  };

  return (
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="blueprint min-w-0 p-5">
        <h1 className="mb-4 font-heading text-xl uppercase md:text-[22px]">Entrega</h1>

        {/* A escolha vem antes do formulário: quem retira na loja não tem
            endereço de entrega para preencher. */}
        <ShippingOptions
          selected={shippingOption}
          onSelect={setShippingOption}
          quote={quote}
        />

        {pickup ? (
          <PickupBlock onContinue={handlePickup} />
        ) : (
          <div className="mt-7 border-t border-divider pt-6">
            <AddressForm
              defaultValues={initialValues}
              onSubmit={handleSubmit}
              onCepChange={setCep}
            >
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-divider pt-5">
                <Button variant="outline" asChild>
                  <Link href="/carrinho">
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Link>
                </Button>
                <Button type="submit" disabled={quote.status !== "available"}>
                  Continuar
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </AddressForm>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-6">
        <OrderSummary
          showShipping
          shippingLabel={pickup ? "Retirada no balcão" : "Entrega"}
          shippingCost={shippingCost}
          shippingPending={!pickup && quote.status !== "available"}
          showAction={false}
          showItems
        />
      </div>
    </div>
  );
}
