import { unstable_cache } from "next/cache";
import type { Promotion as PayloadPromotion } from "@/payload-types";
import type { Promotion, PromotionShowcase } from "@/types/promotion";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { sellingPrice } from "@/lib/commerce";
import { getPayloadClient } from "./payload-client";
import { getStoreSettings } from "./settings";

const MAX_SLIDES = 6;

/** "08 – 15 ago 2026" — o intervalo coberto pelas promoções no ar. */
function formatPeriod(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  // "ago." → "ago"; o Intl junta mês e ano com "de", que não cabe no rótulo.
  const clean = (d: Date) => `${month.format(d).replace(".", "")} ${d.getFullYear()}`;

  if (start && end) {
    // Mesmo mês: "08 – 15 ago 2026". Meses diferentes: "28 ago – 03 set 2026".
    const mesmoMes = clean(start) === clean(end);
    return mesmoMes
      ? `${day.format(start)} – ${day.format(end)} ${clean(end)}`
      : `${day.format(start)} ${clean(start)} – ${day.format(end)} ${clean(end)}`;
  }
  const only = (start ?? end) as Date;
  return `${start ? "a partir de" : "até"} ${day.format(only)} ${clean(only)}`;
}

/**
 * Extrai a porcentagem anunciada no rótulo ("até 45% off" → 45). O texto é
 * livre no admin, então quando não houver número a promoção só não contribui
 * para a régua — não é erro.
 */
function labelPercent(label: string | null | undefined): number {
  if (!label) return 0;
  const found = label.match(/(\d{1,3})\s*%/);
  const value = found ? Number(found[1]) : 0;
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : 0;
}

function mapPromotion(doc: PayloadPromotion): Promotion {
  const product = typeof doc.product === "object" && doc.product !== null ? doc.product : null;
  const price = product
    ? sellingPrice(product.price, product.discountPercent)
    : null;

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description ?? null,
    discountLabel: doc.discountLabel ?? null,
    note: doc.note ?? null,
    ctaLabel: doc.ctaLabel ?? null,
    ctaUrl: doc.ctaUrl ?? null,
    productName: product?.name ?? null,
    productHref: product ? `/produtos/${product.id}` : null,
    // Texto livre ganha do preço calculado — o admin pode querer "a partir de".
    priceLabel: doc.priceLabel ?? (price !== null ? formatPrice(price) : null),
    image: doc.image ?? product?.productMainImg ?? null,
  };
}

async function fetchShowcase(): Promise<PromotionShowcase> {
  const payload = await getPayloadClient();
  const now = new Date().toISOString();

  // Data em branco = sem restrição: a promoção vale antes/depois de sempre.
  const result = await payload.find({
    collection: "promotions",
    where: {
      and: [
        { active: { equals: true } },
        { or: [{ startDate: { less_than_equal: now } }, { startDate: { exists: false } }] },
        { or: [{ endDate: { greater_than_equal: now } }, { endDate: { exists: false } }] },
      ],
    },
    sort: "order",
    limit: MAX_SLIDES,
    depth: 1,
  });

  const docs = result.docs as PayloadPromotion[];
  const starts = docs.map((d) => d.startDate).filter(Boolean) as string[];
  const ends = docs.map((d) => d.endDate).filter(Boolean) as string[];

  const settings = await getStoreSettings();

  return {
    promotions: docs.map(mapPromotion),
    campaignName: settings.campaign.name,
    maxDiscountPercent: Math.max(0, ...docs.map((d) => labelPercent(d.discountLabel))),
    campaignPeriod: formatPeriod(
      starts.length ? new Date(Math.min(...starts.map((s) => +new Date(s)))) : null,
      ends.length ? new Date(Math.max(...ends.map((s) => +new Date(s)))) : null,
    ),
  };
}

/**
 * As promoções no ar agora, com o cabeçalho da campanha. Revalidada pelo hook
 * da collection sempre que alguém salva uma promoção — mas também por tempo,
 * porque a janela de datas vira sozinha.
 */
export const getPromotionShowcase = unstable_cache(fetchShowcase, ["catalog-promotions"], {
  tags: ["promotions", "store-settings"],
  revalidate: 300,
});
