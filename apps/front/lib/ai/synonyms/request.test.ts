import assert from "node:assert/strict";
import { test } from "node:test";
import { parseGroupsJson } from "./request";

test("lê JSON puro", () => {
  assert.deepEqual(parseGroupsJson('{"groups": [["tv", "televisão"]]}'), [["tv", "televisão"]]);
});

test("tolera cerca de código e texto em volta", () => {
  const text = 'Aqui estão:\n```json\n{"groups": [["fone", "headset"]]}\n```\nPronto.';
  assert.deepEqual(parseGroupsJson(text), [["fone", "headset"]]);
});

test("formato errado ou ilegível vira lista vazia", () => {
  assert.deepEqual(parseGroupsJson('{"groups": "tv"}'), []);
  assert.deepEqual(parseGroupsJson("{ quebrado"), []);
  assert.deepEqual(parseGroupsJson("sem json"), []);
});
