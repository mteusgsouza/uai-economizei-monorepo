import { CreditCard } from "lucide-react";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { cn } from "@workspace/ui/lib/utils";
import type { CardPlan, StoreSettings } from "@/lib/commerce";
import { cardPlans, pixPrice } from "@/lib/commerce";
import type { Product } from "@/types/product";
import { Mono } from "@/components/ui/mono";

/** Quando a loja não nomeia o pagamento à vista, este é o nome. */
const CASH_LABEL = "Dinheiro / Transferência / Pix";

/**
 * A tabela de formas de pagamento, fechando a coluna de compra logo abaixo do
 * frete: o preço à vista e o que cada parcelamento custa por mês, com o
 * acréscimo do cartão já aplicado (`cardPlans`).
 *
 * As taxas vêm do admin — sem nenhuma cadastrada a tabela não aparece, porque
 * inventar parcela é inventar preço.
 */
export function ProductPaymentTable({
  product,
  settings,
}: {
  product: Product;
  settings: StoreSettings;
}) {
  const fees = settings.cardFees;
  if (!fees || fees.hidden) return null;

  const plans = cardPlans(product.value, fees.rates ?? []);
  if (plans.length === 0) return null;

  // O à vista acompanha o PIX quando o produto entra no desconto: é o mesmo
  // dinheiro na mão que a linha anuncia.
  const cashValue =
    product.pixDiscount && settings.pixDiscountPercent > 0
      ? pixPrice(product.value, settings.pixDiscountPercent)
      : product.value;

  // Duas colunas como na tabela impressa: 1 a 6 de um lado, 7 a 12 do outro.
  const half = Math.ceil(plans.length / 2);
  const columns = [plans.slice(0, half), plans.slice(half)].filter(
    (column) => column.length > 0,
  );

  return (
    <section className="blueprint mt-4">
      <div className="flex items-center gap-2 border-b border-divider px-3 py-2">
        <CreditCard className="size-[15px] flex-none text-primary" strokeWidth={1.5} />
        <Mono className="text-ink/70">Formas de pagamento</Mono>
      </div>

      <div className="flex items-baseline justify-between gap-2 border-b border-divider px-3 py-2">
        <Mono className="text-ink/60">{fees.cashLabel?.trim() || CASH_LABEL}</Mono>
        <span className="font-heading text-[15px] leading-none text-accent-700">
          {formatPrice(cashValue)}
        </span>
      </div>

      <div className="grid grid-cols-2">
        {columns.map((column, index) => (
          <div key={index} className={cn(index > 0 && "border-l border-divider")}>
            {column.map((plan) => (
              <PlanRow key={plan.installments} plan={plan} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Uma linha do parcelamento: quantas vezes de quanto. */
function PlanRow({ plan }: { plan: CardPlan }) {
  return (
    <div className="flex items-baseline justify-between gap-1.5 px-3 py-1">
      <Mono className="text-ink/55">
        Cartão {plan.installments}x
        {plan.percent === 0 && <span className="text-accent-700"> s/ juros</span>}
      </Mono>
      <span className="text-[13px] tabular-nums">{formatPrice(plan.perInstallment)}</span>
    </div>
  );
}
