import assert from "node:assert/strict";
import { test } from "node:test";
import type { StoreIdentity } from "./commerce";
import {
  DEFAULT_STORE_NAME,
  storeLegalLine,
  storeName,
  storeWordmark,
} from "./store-identity";

const EMPTY: StoreIdentity = {
  name: null,
  logoMark: null,
  logoWord: null,
  tagline: null,
  legalName: null,
  taxId: null,
};

function identity(overrides: Partial<StoreIdentity>): StoreIdentity {
  return { ...EMPTY, ...overrides };
}

test("loja sem nome cai no padrão neutro", () => {
  assert.equal(storeName(EMPTY), DEFAULT_STORE_NAME);
  assert.equal(storeName(null), DEFAULT_STORE_NAME);
  assert.equal(storeName(identity({ name: "   " })), DEFAULT_STORE_NAME);
});

test("nome de duas palavras deriva a marca que o site sempre teve", () => {
  const { mark, word } = storeWordmark(identity({ name: "UAI Economizei" }));
  assert.equal(mark, "UAI");
  assert.equal(word, "Economizei");
});

test("nome de uma palavra usa as primeiras letras como sigla", () => {
  const { mark, word } = storeWordmark(identity({ name: "Economizei" }));
  assert.equal(mark, "ECO");
  assert.equal(word, "Economizei");
});

test("nome de três palavras joga o resto na palavra", () => {
  const { mark, word } = storeWordmark(identity({ name: "Casa e Cia Materiais" }));
  assert.equal(mark, "CAS");
  assert.equal(word, "e Cia Materiais");
});

test("override do lojista vence a derivação e a sigla sai em caixa alta", () => {
  const { mark, word } = storeWordmark(
    identity({ name: "Casa e Cia Materiais", logoMark: "cc", logoWord: "Casa & Cia" }),
  );
  assert.equal(mark, "CC");
  assert.equal(word, "Casa & Cia");
});

test("sem CNPJ a linha legal sai só com o nome", () => {
  assert.equal(storeLegalLine(identity({ name: "UAI Economizei" }), 2026), "© 2026 UAI Economizei");
});

test("razão social assina no lugar do nome quando existe", () => {
  const line = storeLegalLine(
    identity({ name: "UAI Economizei", legalName: "Economizei LTDA", taxId: "12.345.678/0001-90" }),
    2026,
  );
  assert.equal(line, "© 2026 Economizei LTDA · CNPJ 12.345.678/0001-90");
});
