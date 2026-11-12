import { createHmac, timingSafeEqual } from "node:crypto";

/** Mensagens por navegador dentro da janela — barra o abuso antes de gastar token. */
export const QUOTA_LIMIT = 10;
export const QUOTA_WINDOW_MS = 60 * 60 * 1000;
export const QUOTA_COOKIE = "ue_ai_quota";

interface QuotaState {
  count: number;
  windowStart: number;
}

export interface QuotaDecision {
  allowed: boolean;
  /** Valor novo do cookie (assinado). Só muda quando a mensagem foi aceita. */
  cookieValue: string;
  /** Segundos até a janela virar — vira o `maxAge` do cookie. */
  maxAge: number;
}

function sign(payload: string): string {
  const secret = process.env.PAYLOAD_SECRET ?? "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encode(state: QuotaState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function isQuotaState(value: unknown): value is QuotaState {
  if (typeof value !== "object" || value === null) return false;
  const { count, windowStart } = value as Record<string, unknown>;
  return typeof count === "number" && typeof windowStart === "number";
}

/** Cookie ausente, adulterado ou ilegível = janela nova (aceitável para o porte da loja). */
function decode(raw: string | undefined): QuotaState | null {
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString());
    return isQuotaState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Conta uma mensagem na cota do navegador, ou recusa se ela já estourou. */
export function consumeQuota(raw: string | undefined, now = Date.now()): QuotaDecision {
  const current = decode(raw);
  const state =
    current && now - current.windowStart < QUOTA_WINDOW_MS
      ? current
      : { count: 0, windowStart: now };
  const maxAge = Math.max(1, Math.ceil((state.windowStart + QUOTA_WINDOW_MS - now) / 1000));

  if (state.count >= QUOTA_LIMIT) {
    return { allowed: false, cookieValue: encode(state), maxAge };
  }
  return { allowed: true, cookieValue: encode({ ...state, count: state.count + 1 }), maxAge };
}
