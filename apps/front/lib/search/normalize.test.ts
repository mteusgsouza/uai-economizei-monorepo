import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { foldText, hasSearchTerms, tokenize } from "./normalize";

const parts = (text: string) => tokenize(foldText(text)).flatMap((chunk) => chunk.parts);

describe("foldText", () => {
  it("tira acento e caixa", () => {
    assert.equal(foldText("Mouse Óptico AMARRAÇÃO"), "mouse optico amarracao");
  });

  it("colapsa espaços extras", () => {
    assert.equal(foldText("  Kit   de  Ferramentas "), "kit de ferramentas");
  });

  it("gruda a unidade no número", () => {
    assert.equal(foldText("8 GB"), "8gb");
    assert.equal(foldText("240GB"), "240gb");
    assert.equal(foldText("129 Pc"), "129pc");
    assert.equal(foldText("41 Peças"), "41pc");
    assert.equal(foldText("9 Metros"), "9m");
  });

  it("trata polegada escrita de vários jeitos", () => {
    assert.equal(foldText('Monitor 28"'), "monitor 28pol");
    assert.equal(foldText("28 polegadas"), "28pol");
  });

  it("normaliza separador de milhar e decimal", () => {
    assert.equal(foldText("1.000 DPI"), "1000dpi");
    assert.equal(foldText("1,5 Ton"), "1.5ton");
    assert.equal(foldText("USB 3.0"), "usb 3.0");
  });
});

describe("tokenize", () => {
  it("tira stopwords, mas mantém 'sem'", () => {
    assert.deepEqual(parts("Teclado sem fio de mesa"), ["teclado", "sem", "fio", "mesa"]);
  });

  it("guarda partes e forma junta de códigos", () => {
    assert.deepEqual(tokenize(foldText("PY9-00021")), [{ parts: ["py9", "00021"], joined: "py900021" }]);
    assert.deepEqual(tokenize(foldText("LU28E590DS/ZD")), [
      { parts: ["lu28e590ds", "zd"], joined: "lu28e590dszd" },
    ]);
    assert.deepEqual(tokenize(foldText("Micro-ondas")), [
      { parts: ["micro", "ondas"], joined: "microondas" },
    ]);
  });

  it("descarta letra solta, mas a forma junta fica", () => {
    assert.deepEqual(tokenize(foldText("M.2")), [{ parts: [], joined: "m2" }]);
  });

  it("mantém o decimal numa palavra só", () => {
    assert.deepEqual(parts("Cinta 1,5 Ton"), ["cinta", "1.5ton"]);
  });
});

describe("hasSearchTerms", () => {
  it("é falso quando não sobra termo", () => {
    assert.equal(hasSearchTerms("   "), false);
    assert.equal(hasSearchTerms("de da"), false);
    assert.equal(hasSearchTerms("a"), false);
  });

  it("é verdadeiro com um termo de verdade", () => {
    assert.equal(hasSearchTerms("ssd"), true);
    assert.equal(hasSearchTerms("tv"), true);
  });
});
