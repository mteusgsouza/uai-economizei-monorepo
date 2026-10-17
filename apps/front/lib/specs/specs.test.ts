import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSpecSheet, formatLooseSpecValue, formatSpecValue } from "./format";
import { specKey, withSpecKeys } from "./keys";
import type { SpecFieldDef } from "./types";
import {
  type RawSpecField,
  mergeSpecFields,
  orphanKeys,
  parseDecimal,
  parseSpecValues,
  setSpecValue,
  toSpecFieldDefs,
} from "./values";

const field = (key: string, extra: Partial<SpecFieldDef> = {}): SpecFieldDef => ({
  key,
  label: key,
  type: "text",
  unit: null,
  options: [],
  group: null,
  ...extra,
});

describe("chaves", () => {
  it("vem do nome, sem acento nem pontuação", () => {
    assert.equal(specKey("Memória RAM"), "memoria_ram");
    assert.equal(specKey("  Potência (W) "), "potencia_w");
    assert.equal(specKey("???"), "campo");
  });

  it("preserva a chave existente mesmo com o nome trocado", () => {
    const [kept] = withSpecKeys([{ label: "Memória", key: "memoria_ram" }]);
    assert.equal(kept?.key, "memoria_ram");
  });

  it("não repete chave dentro do modelo", () => {
    const keys = withSpecKeys([{ label: "Garantia" }, { label: "Garantia" }]).map((f) => f.key);
    assert.deepEqual(keys, ["garantia", "garantia_2"]);
  });
});

describe("campos do modelo", () => {
  it("descarta campo incompleto e unidade fora de número", () => {
    // Dado velho no banco pode trazer um tipo que o modelo não conhece mais
    const unknownType = { key: "x", label: "Sem tipo", type: "outro" } as unknown as RawSpecField;
    const defs = toSpecFieldDefs([
      { key: "cor", label: "Cor", type: "text", unit: "GB" },
      unknownType,
      { key: "sem-chave", label: "", type: "text" },
      { key: "ram", label: "RAM", type: "number", unit: " GB ", options: ["", " "] },
    ]);
    assert.deepEqual(defs.map((d) => [d.key, d.unit]), [["cor", null], ["ram", "GB"]]);
    assert.deepEqual(defs[1]?.options, []);
  });

  it("o modelo vence o campo comum de mesma chave", () => {
    const merged = mergeSpecFields(
      [field("garantia", { label: "Garantia do fabricante" })],
      [field("garantia"), field("voltagem")],
    );
    assert.deepEqual(merged.map((f) => f.label), ["Garantia do fabricante", "voltagem"]);
  });
});

describe("valores", () => {
  it("mantém só primitivos preenchidos", () => {
    const values = parseSpecValues({ a: " 16 ", b: "", c: 3, d: Number.NaN, e: false, f: {} });
    assert.deepEqual(values, { a: "16", c: 3, e: false });
    assert.deepEqual(parseSpecValues([1, 2]), {});
  });

  it("vazio remove a chave", () => {
    assert.deepEqual(setSpecValue({ ram: 16 }, "ram", ""), {});
    assert.deepEqual(setSpecValue({}, "ram", 8), { ram: 8 });
  });

  it("aponta valores sem campo no modelo", () => {
    assert.deepEqual(orphanKeys({ ram: 16, cor: "azul" }, [field("ram")]), ["cor"]);
  });

  it("lê número do jeito brasileiro", () => {
    assert.equal(parseDecimal("15,6"), 15.6);
    assert.equal(parseDecimal("1.200"), 1200);
    assert.equal(parseDecimal("1.200,5"), 1200.5);
    assert.equal(parseDecimal("1.5"), 1.5);
    assert.equal(parseDecimal("abc"), null);
    assert.equal(parseDecimal("  "), null);
  });
});

describe("ficha montada", () => {
  it("formata número com unidade e sim/não", () => {
    assert.equal(formatSpecValue(field("p", { type: "number", unit: "W" }), 1200), "1.200 W");
    assert.equal(formatSpecValue(field("t", { type: "number", unit: "pol" }), 15.6), "15,6 pol");
    assert.equal(formatSpecValue(field("b", { type: "boolean" }), false), "Não");
  });

  it("valor solto sai legível e sem unidade", () => {
    assert.equal(formatLooseSpecValue(true), "Sim");
    assert.equal(formatLooseSpecValue(1200.5), "1.200,5");
    // Sim/Não não ganha unidade nem se o campo virou número depois
    assert.equal(formatSpecValue(field("x", { type: "number", unit: "W" }), true), "Sim");
  });

  it("agrupa na ordem do modelo e pula campo vazio", () => {
    const sheet = buildSpecSheet(
      [
        field("cpu", { group: "Desempenho" }),
        field("tela", { group: "Tela" }),
        field("ram", { group: "Desempenho" }),
        field("garantia"),
      ],
      { cpu: "Ryzen 5", ram: "16 GB", garantia: "12 meses" },
    );
    assert.deepEqual(
      sheet.map((g) => [g.title, g.rows.map((r) => r.key)]),
      [["Desempenho", ["cpu", "ram"]], [null, ["garantia"]]],
    );
  });
});
