"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Skeleton } from "@workspace/ui/components/skeleton";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderIds = searchParams.get("orderId") ?? "";
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-lg px-8 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/10">
          <CheckCircle className="h-10 w-10 text-brand-green" />
        </div>
      </div>

      <h1 className="mt-6 font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
        Pedido Confirmado!
      </h1>
      <p className="mt-3 text-steel">
        Seu pedido foi recebido e esta sendo processado. Voce recebera
        atualizacoes por email.
      </p>

      {orderIds.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <p className="text-sm text-stone">Numero do pedido</p>
            <p className="mt-1 font-mono text-lg font-semibold text-ink">
              #{orderIds}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button asChild className="rounded-full" size="lg">
          <Link href="/">
            <ShoppingBag className="h-4 w-4" />
            Continuar Comprando
          </Link>
        </Button>

        <p className="text-xs text-stone">
          Redirecionando em {countdown}s...
        </p>
      </div>
    </div>
  );
}

function SuccessSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-8 text-center">
      <div className="flex justify-center">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
      <Skeleton className="mx-auto mt-6 h-10 w-64" />
      <Skeleton className="mx-auto mt-3 h-5 w-80" />
      <Skeleton className="mx-auto mt-8 h-24 w-full rounded-xl" />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <Suspense fallback={<SuccessSkeleton />}>
          <SuccessContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
