/**
 * Os textos que a loja edita no admin (Configurações da loja): a régua de
 * números da home e a faixa de vantagens. Aqui só se resolve o que aparece —
 * quanto o cliente paga é assunto de `lib/commerce.ts`.
 *
 * Um item com fonte calculada some sozinho quando o número não existe (desconto
 * zerado, frete grátis desligado): a loja escolhe o que mostrar, mas ninguém
 * anuncia "0% de desconto".
 */

import { formatPrice } from "@workspace/ui/lib/format-price";
import type {
  Benefit,
  BenefitIcon,
  BenefitSource,
  HomeStat,
  HomeStatSource,
  StoreSettings,
} from "@/lib/commerce";

/** A régua que a home mostra enquanto a loja não configurar a sua. */
export const DEFAULT_HOME_STATS: HomeStat[] = [
  { source: "maxDiscount", value: null, label: "desconto máx." },
  { source: "installments", value: null, label: "sem juros" },
  { source: "manual", value: "48h", label: "entrega expressa" },
];

/** A faixa de vantagens padrão, igual à que a home trazia hardcoded. */
export const DEFAULT_BENEFITS: Benefit[] = [
  { source: "freeShipping", icon: "truck", title: null, note: null },
  { source: "installments", icon: "creditCard", title: null, note: null },
  { source: "manual", icon: "refresh", title: "30 dias", note: "Troca ou devolução sem custo" },
  { source: "manual", icon: "shield", title: "Compra segura", note: "Pagamento criptografado" },
];

type StatSettings = Pick<StoreSettings, "homeStats" | "maxInstallments" | "pixDiscountPercent">;
type BenefitSettings = Pick<
  StoreSettings,
  "benefits" | "freeShipping" | "maxInstallments" | "pixDiscountPercent"
>;

/**
 * Lista configurada pela loja, ou o padrão quando ela ainda não mexeu em nada.
 * Tolerante ao campo ausente (cache antigo, resposta REST parcial) — a vitrine
 * não pode cair por causa de um objeto defasado.
 */
function configured<T>(
  section: { hidden: boolean; items: T[] } | undefined,
  fallback: T[],
): T[] {
  if (!section) return fallback;
  if (section.hidden) return [];
  return section.items?.length ? section.items : fallback;
}

/** Resolve os destaques da home em pares número/legenda. */
export function resolveHomeStats(
  settings: StatSettings,
  maxDiscountPercent: number,
): { value: string; label: string }[] {
  return configured(settings.homeStats, DEFAULT_HOME_STATS).flatMap(
    ({ source, value, label }) => {
      const resolved = resolveStatValue(source, value, settings, maxDiscountPercent);
      return resolved && label ? [{ value: resolved, label }] : [];
    },
  );
}

function resolveStatValue(
  source: HomeStatSource,
  value: string | null,
  settings: Pick<StoreSettings, "maxInstallments" | "pixDiscountPercent">,
  maxDiscountPercent: number,
): string | null {
  switch (source) {
    case "maxDiscount":
      return percentValue(maxDiscountPercent);
    case "installments": {
      const parcels = installmentCount(settings.maxInstallments);
      return parcels > 1 ? `${parcels}x` : null;
    }
    case "pixDiscount":
      return percentValue(settings.pixDiscountPercent);
    default:
      return value?.trim() || null;
  }
}

/** Resolve a faixa de vantagens em trios ícone/título/nota. */
export function resolveBenefits(
  settings: BenefitSettings,
): { icon: BenefitIcon; title: string; note: string }[] {
  return configured(settings.benefits, DEFAULT_BENEFITS).flatMap(
    ({ source, icon, title, note }) => {
      const text = resolveBenefitText(source, title, note, settings);
      return text ? [{ icon, ...text }] : [];
    },
  );
}

function resolveBenefitText(
  source: BenefitSource,
  title: string | null,
  note: string | null,
  settings: Pick<StoreSettings, "freeShipping" | "maxInstallments" | "pixDiscountPercent">,
): { title: string; note: string } | null {
  switch (source) {
    case "freeShipping": {
      const { enabled, minValue } = settings.freeShipping;
      if (!enabled) return null;
      return {
        title: "Frete grátis",
        note: `Acima de ${formatPrice(minValue)} para todo o Brasil`,
      };
    }
    case "installments": {
      const pix = percentValue(settings.pixDiscountPercent);
      return {
        title: `${installmentCount(settings.maxInstallments)}x sem juros`,
        note: pix ? `Ou ${pix} off à vista no PIX` : "No cartão de crédito",
      };
    }
    default: {
      const manualTitle = title?.trim();
      return manualTitle ? { title: manualTitle, note: note?.trim() ?? "" } : null;
    }
  }
}

/** `null` quando não há o que anunciar — zero, negativo ou valor inválido. */
function percentValue(percent: number | null | undefined): string | null {
  if (!Number.isFinite(percent ?? NaN)) return null;
  const rounded = Math.round(Math.min(100, Math.max(0, percent as number)));
  return rounded > 0 ? `${rounded}%` : null;
}

function installmentCount(maxInstallments: number): number {
  return Math.max(1, Math.trunc(maxInstallments) || 1);
}
