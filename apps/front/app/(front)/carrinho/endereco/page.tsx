"use client";

import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/auth-guard";
import { AddressStep } from "@/components/checkout/address-step";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/lib/cart-context";
import { toAddressFormValues } from "@/lib/address";
import { defaultAddress, useAddresses } from "@/hooks/use-addresses";

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
