"use client";

import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { CreditCardForm } from "@/components/checkout/credit-card-form";
import { PixInfo } from "@/components/checkout/pix-info";
import { BoletoInfo } from "@/components/checkout/boleto-info";
import type { PaymentDetails, PaymentMethod } from "@/lib/checkout-context";

interface PaymentBlockProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  details: PaymentDetails;
  onDetailsChange: (details: PaymentDetails) => void;
  /** Total à vista e quanto se economiza — o selector mostra os dois no PIX. */
  pixTotal: number;
  pixSaving: number;
}

/**
 * O caminho de quem paga pelo site: escolher a forma e preencher o que ela
 * pede. Cada forma traz o próprio detalhe; nenhuma delas fala com gateway
 * ainda.
 */
export function PaymentBlock({
  selected,
  onSelect,
  details,
  onDetailsChange,
  pixTotal,
  pixSaving,
}: PaymentBlockProps) {
  return (
    <>
      <h2 className="mb-4 font-heading text-xl uppercase md:text-[22px]">Pagamento</h2>

      <PaymentMethodSelector
        selected={selected}
        onSelect={onSelect}
        pixTotal={pixTotal}
        pixSaving={pixSaving}
      />

      <div className="mt-5">
        {selected === "CREDIT_CARD" && (
          <CreditCardForm defaultValues={details} onChange={onDetailsChange} />
        )}
        {selected === "PIX" && <PixInfo />}
        {selected === "BOLETO" && <BoletoInfo />}
      </div>
    </>
  );
}
