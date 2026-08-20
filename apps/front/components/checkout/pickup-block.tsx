"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Store } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { addressLines } from "@/lib/address";
import { useStoreSettings } from "@/lib/store-settings-context";
import { Mono } from "@/components/ui/mono";

/**
 * O caminho da retirada: nada a preencher, só onde buscar. O endereço vem do
 * StoreSettings — cadastrado no admin, não fixo no código.
 */
export function PickupBlock({ onContinue }: { onContinue: () => void }) {
  const { pickupAddress } = useStoreSettings();
  const lines = pickupAddress ? addressLines(pickupAddress) : [];

  return (
    <div className="mt-7">
      <div className="blueprint flex gap-3.5 p-4">
        <Store className="mt-0.5 size-5 flex-none text-steel" strokeWidth={1.5} />
        <div>
          <Mono as="div" className="text-ink/50">
            Retire em
          </Mono>
          {lines.length > 0 ? (
            <div className="mt-1 text-[15px] leading-normal">
              {lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-[15px]">Nossa loja física</div>
          )}
          <Mono as="div" className="mt-2 text-accent-700">
            Sem frete · avisamos quando estiver separado
          </Mono>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-divider pt-5">
        <Button variant="outline" asChild>
          <Link href="/carrinho">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <Button type="button" onClick={onContinue}>
          Continuar
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
