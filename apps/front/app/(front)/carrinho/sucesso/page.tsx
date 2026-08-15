"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { Mono } from "@/components/ui/mono";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderIds = searchParams.get("orderId") ?? "";

  return (
    <div className="mx-auto mt-8 max-w-lg">
      <div className="blueprint p-7 text-center">
        <div className="mx-auto grid size-14 place-items-center bg-primary text-canvas">
          <Check className="size-7" strokeWidth={1.5} />
        </div>

        <h1 className="mt-5 font-heading text-[28px] uppercase leading-none md:text-[32px]">
          Pedido confirmado
        </h1>
        <p className="mt-2 text-[15px] text-ink/70">
          Recebemos seu pedido e ele já está em processamento. As atualizações chegam
          por e-mail.
        </p>

        {orderIds.length > 0 && (
          <div className="mt-6 border-t border-divider pt-4">
            <Mono as="div" className="text-ink/50">
              Número do pedido
            </Mono>
            <div className="mt-1 font-heading text-2xl">#{orderIds}</div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/pedidos">Acompanhar pedido</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/produtos">Continuar comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SuccessSkeleton() {
  return (
    <div className="mx-auto mt-8 max-w-lg">
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
    <CheckoutShell step="revisao">
      <Suspense fallback={<SuccessSkeleton />}>
        <SuccessContent />
      </Suspense>
    </CheckoutShell>
  );
}
