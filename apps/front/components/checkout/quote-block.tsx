import { Receipt } from "lucide-react";
import { Mono } from "@/components/ui/mono";

/** Mesmo texto do `defaultValue` do global — a loja pode não ter salvo nada. */
const DEFAULT_NOTICE =
  "O pagamento é combinado direto com a loja após a confirmação do pedido.";

/**
 * O caminho de quem não paga pelo site: nada a preencher, só o combinado. É o
 * espelho do `PickupBlock` — a loja desligou a etapa, então ela vira aviso.
 */
export function QuoteBlock({ notice }: { notice: string | null }) {
  return (
    <>
      <h2 className="mb-4 font-heading text-xl uppercase md:text-[22px]">Pagamento</h2>

      <div className="blueprint flex gap-3.5 p-4">
        <Receipt className="mt-0.5 size-5 flex-none text-steel" strokeWidth={1.5} />
        <div>
          <Mono as="div" className="text-ink/50">
            Fora do site
          </Mono>
          <div className="mt-1 text-[15px] leading-normal">{notice || DEFAULT_NOTICE}</div>
          <Mono as="div" className="mt-2 text-accent-700">
            Nada é cobrado agora
          </Mono>
        </div>
      </div>
    </>
  );
}
