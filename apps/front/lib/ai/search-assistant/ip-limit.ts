import { createHmac } from "node:crypto";
import { sql, type PostgresAdapter } from "@payloadcms/db-postgres";
import { getPayloadClient } from "@/lib/catalog/payload-client";

/**
 * Mensagens por IP por hora. Mais folgado que a cota do navegador (10): atrás de
 * um mesmo IP podem estar vários clientes (rede da operadora, Wi-Fi público).
 * É a trava que segura quem não guarda o cookie — script ou cookie limpo.
 */
export const IP_LIMIT = 30;

/** Chance de cada pedido apagar contadores com mais de um dia (a tabela não cresce sem fim). */
const CLEANUP_CHANCE = 0.02;

/** IP do cliente. Na Vercel `x-real-ip`/`x-forwarded-for` são escritos pela própria plataforma. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return headers.get("x-real-ip")?.trim() || forwarded || "unknown";
}

/** HMAC do IP: o banco guarda só a chave, nunca o endereço (LGPD). */
function ipKey(ip: string): string {
  return createHmac("sha256", process.env.PAYLOAD_SECRET ?? "").update(`ip:${ip}`).digest("base64url");
}

/** O banco é o `postgresAdapter` (payload.config); o tipo genérico do Payload não expõe o Drizzle. */
function drizzleOf(adapter: object): PostgresAdapter["drizzle"] {
  if (!("drizzle" in adapter)) throw new Error("Adapter do Payload sem Drizzle.");
  return adapter.drizzle as PostgresAdapter["drizzle"];
}

/**
 * Conta uma mensagem para o IP e diz se ainda está dentro do limite. O upsert é
 * uma instrução só — rajadas paralelas não passam todas juntas lendo o mesmo valor.
 */
export async function consumeIpLimit(ip: string): Promise<boolean> {
  const db = drizzleOf((await getPayloadClient()).db);

  const result = await db.execute<{ count: string }>(sql`
    INSERT INTO "ai_rate_limits" ("key", "count", "window_start")
    VALUES (${ipKey(ip)}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "ai_rate_limits"."window_start" < now() - interval '1 hour'
        THEN 1 ELSE "ai_rate_limits"."count" + 1 END,
      "window_start" = CASE WHEN "ai_rate_limits"."window_start" < now() - interval '1 hour'
        THEN now() ELSE "ai_rate_limits"."window_start" END
    RETURNING "count"`);

  if (Math.random() < CLEANUP_CHANCE) {
    await db.execute(sql`DELETE FROM "ai_rate_limits" WHERE "window_start" < now() - interval '1 day'`);
  }

  return Number(result.rows[0]?.count ?? 0) <= IP_LIMIT;
}
