import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { boundedDistance, typoBudget } from "./distance";
import { singularCandidates } from "./singular";

describe("singularCandidates", () => {
  const cases: [plural: string, singular: string][] = [
    ["geladeiras", "geladeira"],
    ["botoes", "botao"],
    ["aneis", "anel"],
    ["jornais", "jornal"],
    ["lencois", "lencol"],
    ["compressores", "compressor"],
    ["luzes", "luz"],
    ["nuvens", "nuvem"],
    ["mesas", "mesa"],
  ];

  for (const [plural, singular] of cases) {
    it(`${plural} → ${singular}`, () => {
      assert.ok(singularCandidates(plural).includes(singular));
    });
  }

  it("deixa em paz palavra com dígito, curta ou sem s", () => {
    assert.deepEqual(singularCandidates("10pcs"), []);
    assert.deepEqual(singularCandidates("ssd"), []);
    assert.deepEqual(singularCandidates("mouse"), []);
  });
});

describe("boundedDistance", () => {
  it("conta uma edição por letra faltando, trocada ou invertida", () => {
    assert.equal(boundedDistance("notbook", "notebook", 1), 1);
    assert.equal(boundedDistance("teclaod", "teclado", 1), 1);
    assert.equal(boundedDistance("samsumg", "samsung", 1), 1);
  });

  it("é zero para palavras iguais", () => {
    assert.equal(boundedDistance("mouse", "mouse", 1), 0);
  });

  it("para quando passa do limite", () => {
    assert.equal(boundedDistance("abcdef", "uvwxyz", 1), 2);
    assert.equal(boundedDistance("ssd", "processador", 2), 3);
  });
});

describe("typoBudget", () => {
  it("cresce com o tamanho da palavra", () => {
    assert.equal(typoBudget("note"), 0);
    assert.equal(typoBudget("teclado"), 1);
    assert.equal(typoBudget("processadores"), 2);
  });

  it("não tolera erro em termo com dígito", () => {
    assert.equal(typoBudget("240gbssd"), 0);
  });
});
