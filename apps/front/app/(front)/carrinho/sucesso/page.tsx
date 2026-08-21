"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { RequireAuth } from "@/components/auth/auth-guard";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { OrderCard } from "@/components/account/order-card";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { Mono } from "@/components/ui/mono";
import { useOrder } from "@/hooks/use-orders";
import { useProductsByIds } from "@/hooks/use-products";
import { useStoreSettings } from "@/lib/store-settings-context";
import type { Product } from "@/types/product";

/** Links antigos traziam ids separados por vírgula; hoje o pedido é um só. */
function readOrderId(raw: string | null): number | null {
  const first = Number(raw?.split(",")[0]);
  return Number.isInteger(first) && first > 0 ? first : null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const settings = useStoreSettings();
  const orderId = readOrderId(searchParams.get("orderId"));

  const { data: order, isLoading } = useOrder(orderId);

  const productIds = useMemo(
    () => (order?.items ?? []).map((item) => item.productId),
    [order],
  );
  const { data: products, isLoading: loadingProducts } = useProductsByIds(productIds, {
    enabled: productIds.length > 0,
  });

  const quoteMode = !settings.onlinePayment.enabled;

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="blueprint p-7 text-center">
        <div className="mx-auto grid size-14 place-items-center bg-primary text-canvas">
          <Check className="size-7" strokeWidth={1.5} />
        </div>

        <h1 className="mt-5 font-heading text-[28px] uppercase leading-none md:text-[32px]">
          Pedido confirmado
        </h1>
        <p className="mt-2 text-[15px] text-ink/70">
          {/* Não prometemos e-mail: não há envio por trás. O que existe de fato
              é esta página e a lista de pedidos da conta. */}
          {quoteMode
            ? (settings.onlinePayment.offlineNotice ??
              "O pagamento é combinado direto com a loja após a confirmação do pedido.")
            : "Recebemos seu pedido e ele já está em processamento."}
        </p>

        {orderId !== null && (
          <div className="mt-6 border-t border-divider pt-4">
            <Mono as="div" className="text-ink/50">
              Número do pedido
            </Mono>
            <div className="mt-1 font-heading text-2xl">#{orderId}</div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="blueprint mt-5 space-y-3 p-5">
          <BlueprintSkeleton className="h-6 w-48" />
          <BlueprintSkeleton className="h-20 w-full" />
        </div>
      ) : order ? (
        // O mesmo card de /pedidos: itens, entrega e acompanhamento já vêm
        // prontos daqui. Sem o rodapé de recomprar — acabou de comprar.
        <div className="mt-5">
          <OrderCard
            order={order}
            products={products ?? new Map<number, Product>()}
            productsLoading={loadingProducts}
            actions={null}
          />
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/pedidos">Acompanhar pedido</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/produtos">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}

function SuccessSkeleton() {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="blueprint space-y-3 p-7">
        <BlueprintSkeleton className="mx-auto size-14" />
        <BlueprintSkeleton className="mx-auto h-8 w-64" />
        <BlueprintSkeleton className="mx-auto h-5 w-full" />
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <RequireAuth>
      <CheckoutShell step="pronto">
        <Suspense fallback={<SuccessSkeleton />}>
          <SuccessContent />
        </Suspense>
      </CheckoutShell>
    </RequireAuth>
  );
}
