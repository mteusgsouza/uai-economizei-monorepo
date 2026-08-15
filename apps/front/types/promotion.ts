/** Um slide do carrossel da home, já resolvido para o que a vitrine desenha. */
export interface Promotion {
  id: number;
  title: string;
  description: string | null;
  /** Só rótulo ("até 45% off") — o desconto real vive em cada produto. */
  discountLabel: string | null;
  note: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  /** Nome do produto em destaque, para a etiqueta da figura. */
  productName: string | null;
  productHref: string | null;
  priceLabel: string | null;
  image: string | null;
}

export interface PromotionShowcase {
  promotions: Promotion[];
  campaignName: string | null;
  /** "08 – 15 ago 2026", derivado das datas das promoções no ar. */
  campaignPeriod: string | null;
  /**
   * O maior desconto anunciado pelos rótulos das promoções no ar — é o que
   * "até 45% off" quer dizer. Alimenta a régua de números sob a vitrine.
   */
  maxDiscountPercent: number;
}
