import { unstable_cache } from "next/cache";
import type {
  Benefit,
  BenefitIcon,
  BenefitSource,
  CardFee,
  HomeStat,
  HomeStatSource,
  StoreSettings,
} from "@/lib/commerce";
import { getPayloadClient } from "./payload-client";

/** Loja sem configuração ainda: nada de frete grátis, nada de PIX, 12x. */
const FALLBACK: StoreSettings = {
  freeShipping: { enabled: false, minValue: 0, area: null },
  pixDiscountPercent: 0,
  maxInstallments: 12,
  // Sem taxa cadastrada não há tabela: preço de parcela é combinado, não chutado.
  cardFees: { hidden: false, cashLabel: null, rates: [] },
  campaign: { name: null },
  // Listas vazias = a vitrine usa os padrões de `lib/storefront-content.ts`.
  homeStats: { hidden: false, items: [] },
  benefits: { hidden: false, items: [] },
  // Sem tema salvo, o site fica com as cores e o formato de `brand.css`.
  theme: { primaryColor: null, radius: null },
};

const STAT_SOURCES: HomeStatSource[] = ["manual", "maxDiscount", "installments", "pixDiscount"];
const BENEFIT_SOURCES: BenefitSource[] = ["manual", "freeShipping", "installments"];
const BENEFIT_ICONS: BenefitIcon[] = [
  "truck",
  "creditCard",
  "shield",
  "refresh",
  "headset",
  "tag",
  "clock",
  "gift",
];

/** Um select gravado antes de a opção existir vira o padrão em vez de vazar. */
function option<T extends string>(options: T[], value: unknown, fallback: T): T {
  return options.find((known) => known === value) ?? fallback;
}

function mapHomeStats(
  items: { source?: string | null; value?: string | null; label?: string | null }[] | null,
): HomeStat[] {
  return (items ?? []).flatMap((item) =>
    item.label
      ? [
          {
            source: option(STAT_SOURCES, item.source, "manual"),
            value: item.value ?? null,
            label: item.label,
          },
        ]
      : [],
  );
}

function mapBenefits(
  items:
    | { source?: string | null; icon?: string | null; title?: string | null; note?: string | null }[]
    | null,
): Benefit[] {
  return (items ?? []).map((item) => ({
    source: option(BENEFIT_SOURCES, item.source, "manual"),
    icon: option(BENEFIT_ICONS, item.icon, "shield"),
    title: item.title ?? null,
    note: item.note ?? null,
  }));
}

/** Linha de taxa sem número utilizável não vira preço — some da tabela. */
function mapCardFees(
  rates: { installments?: number | null; percent?: number | null }[] | null,
): CardFee[] {
  return (rates ?? []).flatMap((rate) =>
    typeof rate.installments === "number" && rate.installments >= 1
      ? [{ installments: rate.installments, percent: rate.percent ?? 0 }]
      : [],
  );
}

async function fetchStoreSettings(): Promise<StoreSettings> {
  const payload = await getPayloadClient();
  const doc = await payload.findGlobal({ slug: "store-settings", depth: 0 });

  return {
    freeShipping: {
      enabled: doc.freeShipping?.enabled ?? false,
      minValue: doc.freeShipping?.minValue ?? 0,
      area: doc.freeShipping?.area ?? null,
    },
    pixDiscountPercent: doc.pixDiscountPercent ?? 0,
    maxInstallments: doc.maxInstallments ?? FALLBACK.maxInstallments,
    cardFees: {
      hidden: doc.cardFees?.hidden ?? false,
      cashLabel: doc.cardFees?.cashLabel ?? null,
      rates: mapCardFees(doc.cardFees?.rates ?? null),
    },
    // O período saiu do global: agora vem das datas das promoções no ar.
    campaign: { name: doc.campaign?.name ?? null },
    homeStats: {
      hidden: doc.homeStats?.hidden ?? false,
      items: mapHomeStats(doc.homeStats?.items ?? null),
    },
    benefits: {
      hidden: doc.benefits?.hidden ?? false,
      items: mapBenefits(doc.benefits?.items ?? null),
    },
    theme: {
      primaryColor: doc.theme?.primaryColor ?? null,
      radius: doc.theme?.radius ?? null,
    },
  };
}

/**
 * Regras comerciais da loja. O global é lido em quase toda página, então vale
 * o cache — invalidado pelo hook `afterChange` do próprio global.
 */
export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    try {
      return await fetchStoreSettings();
    } catch {
      // Antes da migration rodar o global não existe; a vitrine não pode cair
      // por causa disso.
      return FALLBACK;
    }
  },
  // O sufixo muda junto com o formato do objeto cacheado: sem isso, o cache
  // gravado antes destes campos existirem volta sem eles e derruba a home.
  ["catalog-store-settings-v6"],
  { tags: ["store-settings"], revalidate: 300 },
);
