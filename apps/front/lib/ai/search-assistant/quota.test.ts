import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeQuota, QUOTA_LIMIT, QUOTA_WINDOW_MS } from "./quota";

process.env.PAYLOAD_SECRET = "segredo-de-teste";

function spend(times: number, now: number, start?: string): string | undefined {
  let cookie = start;
  for (let i = 0; i < times; i += 1) cookie = consumeQuota(cookie, now).cookieValue;
  return cookie;
}

test("aceita até o limite e recusa a seguinte", () => {
  const now = 1_000_000;
  const cookie = spend(QUOTA_LIMIT, now);
  assert.equal(consumeQuota(cookie, now).allowed, false);
});

test("janela vencida zera a contagem", () => {
  const now = 1_000_000;
  const cookie = spend(QUOTA_LIMIT, now);
  assert.equal(consumeQuota(cookie, now + QUOTA_WINDOW_MS).allowed, true);
});

test("cookie adulterado vira janela nova", () => {
  const now = 1_000_000;
  const cookie = spend(QUOTA_LIMIT, now) ?? "";
  const [, signature] = cookie.split(".");
  const forged = `${Buffer.from(JSON.stringify({ count: 0, windowStart: now })).toString("base64url")}.${signature}`;
  const decision = consumeQuota(forged, now);
  assert.equal(decision.allowed, true);
  assert.notEqual(decision.cookieValue.split(".")[1], signature);
});

test("maxAge acompanha o fim da janela", () => {
  const start = 1_000_000;
  const cookie = spend(1, start);
  const { maxAge } = consumeQuota(cookie, start + QUOTA_WINDOW_MS / 2);
  assert.equal(maxAge, QUOTA_WINDOW_MS / 2 / 1000);
});
