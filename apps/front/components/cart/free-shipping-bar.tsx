import { formatPrice } from "@workspace/ui/lib/format-price";
import { freeShippingProgress, type StoreSettings } from "@/lib/commerce";
import { Mono } from "@/components/ui/mono";

/**
 * Quanto falta para o frete grátis. Não renderiza nada quando a loja não
 * oferece a regra — o bloco inteiro é condicional, não um zero desenhado.
 */
export function FreeShippingBar({
  subtotal,
  settings,
}: {
  subtotal: number;
  settings: Pick<StoreSettings, "freeShipping">;
}) {
  const progress = freeShippingProgress(subtotal, settings);
  if (!progress.active) return null;

  return (
    <div>
      <Mono as="div" className="mb-2 text-ink/55">
        {progress.reached
          ? "Frete grátis liberado"
          : `Faltam ${formatPrice(progress.missing)} para frete grátis`}
      </Mono>
      <div
        className="h-1 border border-divider bg-accent-100"
        role="progressbar"
        aria-valuenow={Math.round(progress.ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${progress.ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
