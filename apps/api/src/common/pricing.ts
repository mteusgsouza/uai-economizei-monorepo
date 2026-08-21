/**
 * Regras de preço da loja, do lado que cobra. Tudo em centavos.
 *
 * ATENÇÃO: gêmeo de `apps/front/lib/commerce.ts`. O site mostra a partir de lá
 * e o pedido é gravado a partir daqui — se as duas cópias arredondarem
 * diferente, o cliente vê um preço e paga outro. Mexeu aqui, mexa lá.
 */

const PAYLOAD_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api';

export interface StoreSettings {
  pixDiscountPercent: number;
  /**
   * Desligado, o pedido nasce como orçamento: sem `Payment`, e o acerto
   * acontece fora do site.
   */
  onlinePaymentEnabled: boolean;
}

/**
 * Loja ilegível: sem desconto de PIX e cobrando pelo site. Deixar de registrar
 * o pagamento de quem cobra é pior do que não aplicar um desconto — e o
 * serviço ainda exige o método antes de gravar, então nada passa em silêncio.
 */
const FALLBACK: StoreSettings = {
  pixDiscountPercent: 0,
  onlinePaymentEnabled: true,
};

function clampPercent(percent: number | null | undefined): number {
  if (!Number.isFinite(percent ?? NaN)) return 0;
  return Math.min(100, Math.max(0, percent as number));
}

/** Preço cobrado: o valor cheio do produto menos o desconto dele. */
export function sellingPrice(
  price: number,
  discountPercent?: number | null,
): number {
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

/**
 * Configuração comercial mantida no admin do Payload. Se a leitura falhar, o
 * pedido segue sem desconto de PIX — cobrar a mais é ruim, mas deixar de
 * registrar o pedido é pior.
 */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${PAYLOAD_URL}/globals/store-settings?depth=0`);
    if (!res.ok) return FALLBACK;
    const doc = (await res.json()) as {
      pixDiscountPercent?: number;
      onlinePayment?: { enabled?: boolean | null };
    };
    return {
      pixDiscountPercent: clampPercent(doc.pixDiscountPercent),
      // Ausente conta como ligado: é um global salvo antes da migration.
      onlinePaymentEnabled: doc.onlinePayment?.enabled ?? true,
    };
  } catch {
    return FALLBACK;
  }
}
