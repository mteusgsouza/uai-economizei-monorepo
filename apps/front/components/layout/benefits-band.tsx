import {
  Clock,
  CreditCard,
  Gift,
  Headset,
  RotateCcw,
  ShieldCheck,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { BenefitIcon, StoreSettings } from "@/lib/commerce";
import { resolveBenefits } from "@/lib/storefront-content";

/** O desenho de cada ícone que a loja pode escolher no admin. */
const ICONS: Record<BenefitIcon, LucideIcon> = {
  truck: Truck,
  creditCard: CreditCard,
  shield: ShieldCheck,
  refresh: RotateCcw,
  headset: Headset,
  tag: Tag,
  clock: Clock,
  gift: Gift,
};

/**
 * A faixa de aço: o único campo de cor cheia do sistema, com o tipo revertido
 * para o papel. Fecha a home e separa o conteúdo do rodapé.
 *
 * Título, nota e ícone saem do global (Configurações da loja → Faixa de
 * vantagens); frete grátis e parcelas continuam se escrevendo sozinhos.
 */
export function BenefitsBand({ settings }: { settings: StoreSettings }) {
  const benefits = resolveBenefits(settings);
  if (benefits.length === 0) return null;

  return (
    <div className="bg-accent-900 text-on-dark">
      <div className="mx-auto grid max-w-[1280px] gap-7 px-6 py-10 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        {benefits.map(({ icon, title, note }) => {
          const Icon = ICONS[icon] ?? ShieldCheck;
          return (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-[22px] flex-none" strokeWidth={1.5} />
              <div>
                <div className="font-heading text-lg uppercase">{title}</div>
                {note && <div className="text-[13px] opacity-70">{note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
