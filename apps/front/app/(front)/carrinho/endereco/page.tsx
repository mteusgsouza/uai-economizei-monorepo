"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { RequireAuth } from "@/components/auth/auth-guard";
import { AddressForm } from "@/components/checkout/address-form";
import type { AddressFormValues } from "@/components/checkout/address-form";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { ShippingOptions } from "@/components/checkout/shipping-options";
import { OrderSummary } from "@/components/cart/order-summary";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/lib/cart-context";
import { toAddressFormValues } from "@/lib/address";
import { defaultAddress, useAddresses } from "@/hooks/use-addresses";
import { useShippingQuote } from "@/hooks/use-shipping-quote";

function AddressStep({ initialValues }: { initialValues?: AddressFormValues }) {
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

  const handleSubmit = (values: AddressFormValues) => {
    setAddress(values);
    setStep("payment");
    router.push("/carrinho/pagamento");
  };

  // Só avança com frete resolvido: entrega calculada ou retirada no balcão
  const canContinue = shippingOption === "pickup" || quote.status === "available";

  return (
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="blueprint min-w-0 p-5">
        <h1 className="mb-4 font-heading text-xl uppercase md:text-[22px]">Entrega</h1>

        <AddressForm
          defaultValues={initialValues}
          onSubmit={handleSubmit}
          onCepChange={setCep}
        >
          <div className="mt-7">
            <ShippingOptions
              selected={shippingOption}
              onSelect={setShippingOption}
              quote={quote}
            />
          </div>

          <div className="mt-7 flex items-center justify-between gap-4 border-t border-divider pt-5">
            <Button variant="outline" asChild>
              <Link href="/carrinho">
                <ArrowLeft className="size-4" />
                Voltar
              </Link>
            </Button>
            <Button type="submit" disabled={!canContinue}>
              Continuar
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </AddressForm>
      </div>

      <div className="lg:sticky lg:top-6">
        <OrderSummary
          showShipping
          shippingLabel={shippingOption === "pickup" ? "Retirada no balcão" : "Entrega"}
          shippingCost={shippingCost}
          shippingPending={shippingOption === "delivery" && quote.status !== "available"}
          showAction={false}
          showItems
        />
      </div>
    </div>
  );
}

function AddressContent() {
  const router = useRouter();
  const { items } = useCart();
  const { address } = useCheckout();
  const { data: addresses, isLoading } = useAddresses();

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  const saved = defaultAddress(addresses);
  // Quem já passou pelo checkout continua de onde parou; quem não passou começa
  // com o endereço padrão da conta.
  const initialValues = address ?? (saved ? toAddressFormValues(saved) : undefined);

  return (
    <CheckoutShell step="entrega">
      {isLoading ? (
        // O formulário é uncontrolled: montar antes dos endereços chegarem
        // deixaria os campos vazios mesmo depois da resposta.
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px]">
          <BlueprintSkeleton className="h-[420px]" />
          <BlueprintSkeleton className="h-52" />
        </div>
      ) : (
        <AddressStep initialValues={initialValues} />
      )}
    </CheckoutShell>
  );
}

export default function AddressPage() {
  return (
    <RequireAuth>
      <AddressContent />
    </RequireAuth>
  );
}
