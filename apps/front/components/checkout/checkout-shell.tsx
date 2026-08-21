"use client";

import { Receipt, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Mono } from "@/components/ui/mono";
import { useStoreSettings } from "@/lib/store-settings-context";
import { CheckoutSteps, type CheckoutStep } from "./checkout-steps";

/**
 * O enquadramento do checkout: cabeçalho enxuto, sem navegação nem busca. A
 * partir daqui a única tarefa é fechar o pedido — qualquer link a mais é um
 * convite a abandonar o carrinho.
 *
 * É client por causa do modo orçamento: as três páginas do carrinho já são, e
 * ler a configuração aqui deixa a régua igual nas três sem repassar prop.
 */
export function CheckoutShell({
  step,
  children,
}: {
  step: CheckoutStep;
  children: React.ReactNode;
}) {
  const quoteMode = !useStoreSettings().onlinePayment.enabled;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-divider">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-4 md:px-10">
          <Logo size="md" />
          <span className="flex-1" />
          <Mono className="hidden items-center gap-1.5 text-ink/55 sm:inline-flex">
            {/* Sem dado sensível digitado, prometer criptografia não diz nada. */}
            {quoteMode ? (
              <>
                <Receipt className="size-[15px]" strokeWidth={1.5} />
                Orçamento · pagamento combinado com a loja
              </>
            ) : (
              <>
                <ShieldCheck className="size-[15px]" strokeWidth={1.5} />
                Ambiente seguro · dados criptografados
              </>
            )}
          </Mono>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-7 md:px-10">
        <CheckoutSteps current={step} quoteMode={quoteMode} />
        {children}
      </main>
    </div>
  );
}
