import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { formatPrice } from "@workspace/ui/lib/format-price";
import type { StoreSettings } from "@/lib/commerce";

/**
 * A faixa de aço: o único campo de cor cheia do sistema, com o tipo revertido
 * para o papel. Fecha a home e separa o conteúdo do rodapé.
 */
export function BenefitsBand({ settings }: { settings: StoreSettings }) {
  const benefits = [
    settings.freeShipping.enabled && {
      icon: Truck,
      title: "Frete grátis",
      note: `Acima de ${formatPrice(settings.freeShipping.minValue)} para todo o Brasil`,
    },
    {
      icon: CreditCard,
      title: `${settings.maxInstallments}x sem juros`,
      note:
        settings.pixDiscountPercent > 0
          ? `Ou ${settings.pixDiscountPercent}% off à vista no PIX`
          : "No cartão de crédito",
    },
    { icon: RotateCcw, title: "30 dias", note: "Troca ou devolução sem custo" },
    { icon: ShieldCheck, title: "Compra segura", note: "Pagamento criptografado" },
  ].filter(Boolean) as { icon: typeof Truck; title: string; note: string }[];

  return (
    <div className="bg-accent-900 text-on-dark">
      <div className="mx-auto grid max-w-[1280px] gap-7 px-6 py-10 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, note }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-[22px] flex-none" strokeWidth={1.5} />
            <div>
              <div className="font-heading text-lg uppercase">{title}</div>
              <div className="text-[13px] opacity-70">{note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
