/**
 * Regras de preço da loja. Tudo em centavos, como o resto do catálogo.
 *
 * ATENÇÃO: `sellingPrice` e `pixPrice` decidem quanto o cliente paga e têm um
 * gêmeo na API (`apps/api/src/common/pricing.ts`), que é quem grava o valor do
 * pedido. As duas cópias precisam arredondar igual — se mexer aqui, mexa lá e
 * rode `pnpm --filter @store/api test`.
 */

/** De onde sai o número de um destaque da régua da home. */
export type HomeStatSource = "manual" | "maxDiscount" | "installments" | "pixDiscount";

export interface HomeStat {
  source: HomeStatSource;
  value: string | null;
  label: string;
}

/** De onde saem o título e a nota de uma vantagem da faixa. */
export type BenefitSource = "manual" | "freeShipping" | "installments";

/** Ícones oferecidos à loja na faixa — o desenho de cada um vive no componente. */
export type BenefitIcon =
  | "truck"
  | "creditCard"
  | "shield"
  | "refresh"
  | "headset"
  | "tag"
  | "clock"
  | "gift";

export interface Benefit {
  source: BenefitSource;
  icon: BenefitIcon;
  title: string | null;
  note: string | null;
}

/** Uma linha da tabela de taxas do cartão: N parcelas custam X% a mais. */
export interface CardFee {
  installments: number;
  percent: number;
}

export interface StoreSettings {
  /** `area`: onde o frete grátis vale — a entrega é regional, não nacional. */
  freeShipping: { enabled: boolean; minValue: number; area: string | null };
  pixDiscountPercent: number;
  maxInstallments: number;
  cardFees: { hidden: boolean; cashLabel: string | null; rates: CardFee[] };
  campaign: { name: string | null };
  homeStats: { hidden: boolean; items: HomeStat[] };
  benefits: { hidden: boolean; items: Benefit[] };
}

/** Textos da vitrine (régua e faixa) moram em `lib/storefront-content.ts`. */

function clampPercent(percent: number | null | undefined): number {
  if (!Number.isFinite(percent ?? NaN)) return 0;
  return Math.min(100, Math.max(0, percent as number));
}

/** Preço cobrado: o valor cheio menos o desconto do produto. */
export function sellingPrice(price: number, discountPercent?: number | null): number {
  const discount = clampPercent(discountPercent);
  if (discount === 0) return price;
  return Math.round((price * (100 - discount)) / 100);
}

/** Preço à vista no PIX. Só vale para produtos marcados com o desconto. */
export function pixPrice(value: number, pixDiscountPercent: number): number {
  const discount = clampPercent(pixDiscountPercent);
  if (discount === 0) return value;
  return Math.round((value * (100 - discount)) / 100);
}

/** Valor de cada parcela no cartão. */
export function installment(value: number, maxInstallments: number): number {
  const parcels = Math.max(1, Math.trunc(maxInstallments) || 1);
  return Math.round(value / parcels);
}

/** Uma linha calculada da tabela de formas de pagamento. */
export interface CardPlan {
  installments: number;
  percent: number;
  /** Quanto o cliente paga por mês, em centavos. */
  perInstallment: number;
  /** O total com a taxa. `perInstallment × installments` pode diferir em centavos. */
  total: number;
}

/**
 * A tabela do cartão: cada linha de taxa aplicada sobre o preço à vista.
 *
 * A taxa entra como acréscimo sobre o total (`400 + 20%` = `480` em 12x de
 * `40,00`), não como juros compostos — é assim que a maquininha repassa e é o
 * número que a loja anuncia. O arredondamento é feito no total e só depois
 * dividido, para a soma das parcelas não fugir do que foi cobrado.
 *
 * ATENÇÃO: isto é vitrine. Quem grava o valor do pedido é a Nest
 * (`apps/api/src/common/pricing.ts`), que hoje não conhece taxa de cartão — o
 * pedido é gravado pelo preço à vista.
 */
export function cardPlans(value: number, rates: CardFee[]): CardPlan[] {
  const seen = new Set<number>();

  return rates
    .flatMap((rate) => {
      const parcels = Math.trunc(rate.installments);
      if (!Number.isFinite(parcels) || parcels < 1 || seen.has(parcels)) return [];
      seen.add(parcels);

      const percent = feePercent(rate.percent);
      const total = Math.round((value * (100 + percent)) / 100);
      return [{ installments: parcels, percent, perInstallment: Math.round(total / parcels), total }];
    })
    .sort((a, b) => a.installments - b.installments);
}

/** Acréscimo do cartão. Negativo não existe; o teto evita erro de digitação virar preço. */
function feePercent(percent: number | null | undefined): number {
  if (!Number.isFinite(percent ?? NaN)) return 0;
  return Math.min(100, Math.max(0, percent as number));
}

/**
 * Quanto falta para o frete grátis. `active: false` quando a loja não oferece —
 * aí a barra de progresso nem aparece.
 */
export function freeShippingProgress(
  subtotal: number,
  settings: Pick<StoreSettings, "freeShipping">,
): { active: boolean; reached: boolean; missing: number; ratio: number } {
  const { enabled, minValue } = settings.freeShipping;
  if (!enabled || minValue <= 0) {
    return { active: false, reached: false, missing: 0, ratio: 0 };
  }
  const missing = Math.max(0, minValue - subtotal);
  return {
    active: true,
    reached: missing === 0,
    missing,
    ratio: Math.min(1, subtotal / minValue),
  };
}

/** Percentual de desconto para o selo, já arredondado. `null` sem desconto. */
export function discountLabel(discountPercent?: number | null): string | null {
  const discount = clampPercent(discountPercent);
  return discount > 0 ? `−${Math.round(discount)}%` : null;
}
