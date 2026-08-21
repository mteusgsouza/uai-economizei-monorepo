import Link from "next/link";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { addressLines } from "@/lib/address";
import type { AddressData } from "@/lib/checkout-context";
import { Mono } from "@/components/ui/mono";

/** O que ficou decidido no passo anterior, com atalho para voltar e mudar. */
export function DeliveryRecap({
  pickup,
  address,
  shippingCost,
}: {
  pickup: boolean;
  address: AddressData | null;
  shippingCost: number;
}) {
  return (
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
        {pickup || !address ? "Retirada no balcão" : addressLines(address).join(" · ")}
      </div>
      <Mono as="div" className="mt-2 text-accent-700">
        {pickup
          ? "Sem frete"
          : shippingCost === 0
            ? "Entrega · grátis"
            : `Entrega · ${formatPrice(shippingCost)}`}
      </Mono>
    </div>
  );
}
