import { formatPrice } from "@workspace/ui/lib/format-price";
import { installment, pixPrice } from "@/lib/commerce";
import type { SpecGroup } from "@/lib/specs/types";
import type { Product } from "@/types/product";

export const EMPTY_CELL = "—";

/** Só o que a tabela compara — o resto do produto não entra aqui. */
export type ComparedProduct = Pick<Product, "value" | "pixDiscount" | "brand" | "isNew" | "stock">;

export interface PaymentTerms {
  pixDiscountPercent: number;
  maxInstallments: number;
}

export interface ComparisonRow {
  key: string;
  label: string;
  /** Um valor por produto, na ordem das colunas. */
  values: string[];
}

function commercialRows(products: ComparedProduct[], terms: PaymentTerms): ComparisonRow[] {
  const row = (key: string, label: string, value: (p: ComparedProduct) => string): ComparisonRow => ({
    key,
    label,
    values: products.map(value),
  });
  const { pixDiscountPercent, maxInstallments } = terms;

  return [
    row("price", "Preço", (p) => formatPrice(p.value)),
    row("pix", "No PIX", (p) =>
      p.pixDiscount && pixDiscountPercent > 0 ? formatPrice(pixPrice(p.value, pixDiscountPercent)) : EMPTY_CELL,
    ),
    row("installments", "Parcelado", (p) =>
      maxInstallments > 1 ? `${maxInstallments}x ${formatPrice(installment(p.value, maxInstallments))}` : EMPTY_CELL,
    ),
    row("brand", "Marca", (p) => p.brand?.name ?? EMPTY_CELL),
    row("condition", "Condição", (p) => (p.isNew ? "Novo" : "Usado")),
    row("stock", "Estoque", (p) => (p.stock > 0 ? "Disponível" : "Esgotado")),
  ];
}

/** Campos da ficha técnica: a união de todos, na ordem em que aparecem. */
function specRows(sheets: SpecGroup[][]): ComparisonRow[] {
  const labels = new Map<string, string>();
  const valuesByProduct = sheets.map((groups) => {
    const values = new Map<string, string>();
    for (const { key, label, value } of groups.flatMap((group) => group.rows)) {
      if (!labels.has(key)) labels.set(key, label);
      values.set(key, value);
    }
    return values;
  });

  return [...labels].map(([key, label]) => ({
    key: `spec:${key}`,
    label,
    values: valuesByProduct.map((values) => values.get(key) ?? EMPTY_CELL),
  }));
}

/**
 * As linhas da tabela de comparação: dados de venda primeiro, ficha técnica
 * depois. Linha em que nenhum produto tem valor sai — não diz nada.
 */
export function comparisonRows(
  products: ComparedProduct[],
  sheets: SpecGroup[][],
  terms: PaymentTerms,
): ComparisonRow[] {
  return [...commercialRows(products, terms), ...specRows(sheets)].filter((row) =>
    row.values.some((value) => value !== EMPTY_CELL),
  );
}
