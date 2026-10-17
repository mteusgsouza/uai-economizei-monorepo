import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type ComparedProduct, EMPTY_CELL, comparisonRows } from "./rows";
import type { SpecGroup } from "../specs/types";

const terms = { pixDiscountPercent: 10, maxInstallments: 12 };

const drill: ComparedProduct = {
  value: 300,
  pixDiscount: true,
  brand: { id: 1, name: "Bosch" },
  isNew: true,
  stock: 3,
};
const usedDrill: ComparedProduct = { value: 120, pixDiscount: false, brand: null, isNew: false, stock: 0 };

const sheet = (rows: Array<[string, string, string]>): SpecGroup[] => [
  { title: null, rows: rows.map(([key, label, value]) => ({ key, label, value })) },
];

const byKey = (key: string) => (rows: ReturnType<typeof comparisonRows>) =>
  rows.find((row) => row.key === key)?.values;

describe("comparisonRows", () => {
  it("compara venda e condição produto a produto", () => {
    const rows = comparisonRows([drill, usedDrill], [[], []], terms);
    assert.deepEqual(byKey("pix")(rows)?.[1], EMPTY_CELL);
    assert.deepEqual(byKey("brand")(rows), ["Bosch", EMPTY_CELL]);
    assert.deepEqual(byKey("condition")(rows), ["Novo", "Usado"]);
    assert.deepEqual(byKey("stock")(rows), ["Disponível", "Esgotado"]);
    assert.ok(byKey("installments")(rows)?.[0]?.startsWith("12x"));
  });

  it("junta os campos da ficha e marca o que falta", () => {
    const rows = comparisonRows(
      [drill, usedDrill],
      [sheet([["potencia", "Potência", "650 W"]]), sheet([["voltagem", "Voltagem", "127 V"], ["potencia", "Potência", "500 W"]])],
      terms,
    );
    assert.deepEqual(byKey("spec:potencia")(rows), ["650 W", "500 W"]);
    assert.deepEqual(byKey("spec:voltagem")(rows), [EMPTY_CELL, "127 V"]);
    const specOrder = rows.filter((row) => row.key.startsWith("spec:")).map((row) => row.label);
    assert.deepEqual(specOrder, ["Potência", "Voltagem"]);
  });

  it("tira a linha que nenhum produto preenche", () => {
    const rows = comparisonRows([usedDrill, { ...usedDrill, value: 90 }], [[], []], terms);
    assert.equal(byKey("pix")(rows), undefined);
    assert.equal(byKey("brand")(rows), undefined);
  });
});
