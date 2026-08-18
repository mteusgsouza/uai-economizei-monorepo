"use client";

import { formatPrice } from "@workspace/ui/lib/format-price";
import { cn } from "@workspace/ui/lib/utils";
import type { PaymentMethod } from "@/lib/checkout-context";
import { useStoreSettings } from "@/lib/store-settings-context";
import { Mono } from "@/components/ui/mono";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  /** Total à vista, para o PIX mostrar quanto fica. */
  pixTotal?: number;
  pixSaving?: number;
}

/**
 * As formas de pagamento como uma lista de fichas — rádio quadrado à esquerda,
 * vantagem à direita. A escolhida é a única tingida.
 */
export function PaymentMethodSelector({
  selected,
  onSelect,
  pixTotal,
  pixSaving = 0,
}: PaymentMethodSelectorProps) {
  const settings = useStoreSettings();

  const options: { id: PaymentMethod; label: string; note: string; accent?: boolean }[] = [
    {
      id: "PIX",
      label: "PIX",
      note:
        pixSaving > 0 && pixTotal !== undefined
          ? `${settings.pixDiscountPercent}% off · ${formatPrice(pixTotal)}`
          : "Aprovação em minutos",
      accent: pixSaving > 0,
    },
    {
      id: "CREDIT_CARD",
      label: "Cartão de crédito",
      note: `até ${settings.maxInstallments}x no cartão`,
    },
    { id: "BOLETO", label: "Boleto", note: "compensa em 2 dias úteis" },
  ];

  return (
    <div className="cgroup flex flex-col border border-divider">
      {options.map((option, i) => {
        const active = selected === option.id;
        return (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 px-4 py-3.5",
              i < options.length - 1 && "border-b border-divider",
              active && "bg-accent-100",
            )}
          >
            <input
              type="radio"
              name="payment-method"
              className="sr-only"
              checked={active}
              onChange={() => onSelect(option.id)}
            />
            <span
              aria-hidden
              className={cn(
                "size-4 flex-none border-[1.5px] transition-colors",
                active
                  ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--color-canvas)]"
                  : "border-divider",
              )}
            />
            <span className="font-heading text-lg uppercase leading-none">
              {option.label}
            </span>
            <span className="flex-1" />
            <Mono className={option.accent ? "text-accent-700" : "text-ink/55"}>
              {option.note}
            </Mono>
          </label>
        );
      })}
    </div>
  );
}
