import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findPhrases, parseSynonymGroups, splitTerms } from "./synonyms";

describe("splitTerms", () => {
  it("aceita vírgula, ponto e vírgula e quebra de linha, sem repetir", () => {
    assert.deepEqual(splitTerms("celular; smartphone\ntelefone celular, Celular, de"), [
      "celular",
      "smartphone",
      "telefone celular",
    ]);
  });
});

describe("parseSynonymGroups", () => {
  it("ignora cadastro com menos de dois termos", () => {
    assert.deepEqual(parseSynonymGroups(["tv", "tv, TV"]), []);
  });

  it("guarda termo com hífen em partes e junto", () => {
    assert.deepEqual(parseSynonymGroups(["micro-ondas, microondas"]), [
      [["micro", "ondas"], ["microondas"]],
    ]);
  });
});

describe("findPhrases", () => {
  const groups = parseSynonymGroups(["fone, fone de ouvido, headset"]);

  it("prefere o termo mais longo", () => {
    const [hit] = findPhrases([["fone"], ["ouvido"], ["bluetooth"]], groups);
    assert.equal(hit?.start, 0);
    assert.deepEqual(hit?.matched, ["fone", "ouvido"]);
  });

  it("acha a frase pela forma no singular", () => {
    const [hit] = findPhrases([["fones", "fone"], ["ouvido"]], groups);
    assert.deepEqual(hit?.matched, ["fone", "ouvido"]);
    assert.ok(hit?.sequences.some((sequence) => sequence.join(" ") === "headset"));
  });

  it("soma os grupos quando o termo está em dois", () => {
    const twoGroups = parseSynonymGroups(["notebook, laptop", "notebook, computador portátil"]);
    const [hit] = findPhrases([["notebook"]], twoGroups);
    const terms = hit?.sequences.map((sequence) => sequence.join(" ")) ?? [];
    assert.deepEqual(terms.sort(), ["computador portatil", "laptop", "notebook"]);
  });

  it("não acha nada quando não há termo cadastrado", () => {
    assert.deepEqual(findPhrases([["mouse"]], groups), []);
  });
});
