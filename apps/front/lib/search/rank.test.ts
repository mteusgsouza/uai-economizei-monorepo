import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankProducts } from "./rank";
import { TEST_CATALOG, TEST_SYNONYMS } from "./test-catalog";

const rank = (term: string) => rankProducts(TEST_CATALOG, TEST_SYNONYMS, term);

describe("rankProducts — tolerância", () => {
  it("corrige erro de digitação e avisa", () => {
    const result = rank("notbook");
    assert.deepEqual(result.ids, [6]);
    assert.equal(result.correctedTerm, "notebook");
  });

  it("aceita marca incompleta sem chamar de erro", () => {
    const result = rank("mouse logitec");
    assert.deepEqual(result.ids, [1]);
    assert.equal(result.correctedTerm, null);
  });

  it("corrige marca incompleta com erro", () => {
    const result = rank("mouse logitek");
    assert.deepEqual(result.ids, [1]);
    assert.equal(result.correctedTerm, "mouse logitech");
  });

  it("ignora acento e plural", () => {
    assert.deepEqual(rank("informática").ids, rank("informatica").ids);
    assert.deepEqual(rank("geladeiras").ids, [9]);
  });

  it("não inventa resultado para termo sem sentido", () => {
    assert.deepEqual(rank("xyzabc").ids, []);
  });
});

describe("rankProducts — códigos e medidas", () => {
  it("acha o código com hífen, junto ou separado", () => {
    for (const term of ["py900021", "PY9-00021", "py9 00021"]) {
      assert.deepEqual(rank(term).ids, [3], term);
    }
  });

  it("casa número com a unidade, sem pegar número maior", () => {
    assert.deepEqual(rank("ssd 240").ids, [4]);
    assert.deepEqual(rank("240").ids, [4]);
  });

  it("entende polegadas", () => {
    assert.deepEqual(rank("28 polegadas").ids, [5]);
  });
});

describe("rankProducts — sinônimos", () => {
  it("fone de ouvido acha headset", () => {
    assert.equal(rank("fone de ouvido").ids[0], 2);
  });

  it("sem fio acha wireless, e 'Sem marca' não conta", () => {
    const ids = rank("sem fio").ids;
    assert.ok(ids.includes(3) && ids.includes(12));
    assert.ok(!ids.includes(6) && !ids.includes(8));
  });
});

describe("rankProducts — ordem", () => {
  it("nome que começa pelo termo vem primeiro", () => {
    assert.deepEqual(rank("mouse").ids, [1, 3]);
  });

  it("empate mantém a ordem da vitrine", () => {
    assert.deepEqual(rank("informatica").ids, [1, 2, 3, 4, 5, 6, 12]);
  });

  it("palavra comum não casa no meio de outra", () => {
    const ids = rank("rede").ids;
    assert.ok(ids.includes(12));
    assert.ok(!ids.includes(11));
  });

  it("sem produto com todos os termos, mostra os que têm o primeiro", () => {
    const result = rank("mouse azul");
    assert.equal(result.mode, "any");
    assert.deepEqual(result.ids, [1, 3, 2]);
  });
});
