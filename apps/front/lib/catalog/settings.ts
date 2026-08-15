import { unstable_cache } from "next/cache";
import type { StoreSettings } from "@/lib/commerce";
import { getPayloadClient } from "./payload-client";

/** Loja sem configuração ainda: nada de frete grátis, nada de PIX, 12x. */
const FALLBACK: StoreSettings = {
  freeShipping: { enabled: false, minValue: 0 },
  pixDiscountPercent: 0,
  maxInstallments: 12,
  campaign: { name: null },
};

async function fetchStoreSettings(): Promise<StoreSettings> {
  const payload = await getPayloadClient();
  const doc = await payload.findGlobal({ slug: "store-settings", depth: 0 });

  return {
    freeShipping: {
      enabled: doc.freeShipping?.enabled ?? false,
      minValue: doc.freeShipping?.minValue ?? 0,
    },
    pixDiscountPercent: doc.pixDiscountPercent ?? 0,
    maxInstallments: doc.maxInstallments ?? FALLBACK.maxInstallments,
    // O período saiu do global: agora vem das datas das promoções no ar.
    campaign: { name: doc.campaign?.name ?? null },
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
  ["catalog-store-settings"],
  { tags: ["store-settings"], revalidate: 300 },
);
