import assert from "node:assert/strict";
import { test } from "node:test";
import { existingTermSet, filterNewGroups } from "./dedupe";

test("existingTermSet normaliza acento e caixa", () => {
  const set = existingTermSet(["Fone de Ouvido, Headset", "Máquina; maquina de lavar"]);
  assert.ok(set.has("fone de ouvido"));
  assert.ok(set.has("headset"));
  assert.ok(set.has("maquina"));
});

test("descarta grupo com qualquer termo já cadastrado", () => {
  const existing = existingTermSet(["geladeira, refrigerador"]);
  const { kept, skipped } = filterNewGroups(
    [["Refrigerador", "frigobar"], ["tv", "televisão"]],
    existing,
  );
  assert.deepEqual(kept, [["tv", "televisão"]]);
  assert.equal(skipped.length, 1);
});

test("descarta grupo com menos de dois termos válidos", () => {
  const { kept, skipped } = filterNewGroups([["celular", "Celular"], ["x"]], new Set());
  assert.equal(kept.length, 0);
  assert.equal(skipped.length, 2);
});

test("deduplica entre os grupos gerados na mesma rodada", () => {
  const { kept, skipped } = filterNewGroups(
    [["tv", "televisão"], ["televisao", "telão"]],
    new Set(),
  );
  assert.equal(kept.length, 1);
  assert.equal(skipped.length, 1);
});
