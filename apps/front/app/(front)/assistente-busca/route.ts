import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { aiEnabled } from "@/lib/ai/anthropic";
import { clientIp, consumeIpLimit } from "@/lib/ai/search-assistant/ip-limit";
import { consumeQuota, QUOTA_COOKIE } from "@/lib/ai/search-assistant/quota";
import { runSearchAssistant } from "@/lib/ai/search-assistant/run";

// Fora de /api/*: essas rotas pertencem ao Payload.
export const maxDuration = 30;

const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(300),
});

const BodySchema = z.object({
  term: z.string().trim().min(1).max(120),
  messages: z
    .array(TurnSchema)
    .min(1)
    .max(6)
    .refine((list) => list[0]?.role === "user" && list[list.length - 1]?.role === "user", {
      message: "A conversa começa e termina com o cliente.",
    }),
});

const LIMIT_MESSAGE = "Limite de mensagens atingido. Use a busca do site.";

function error(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!aiEnabled) return error(503, "Assistente indisponível.");

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(400, "Mensagem inválida.");

  // As cotas vêm antes de qualquer token gasto: primeiro a do navegador (sem banco),
  // depois a do IP, que segura quem descarta o cookie.
  const quota = consumeQuota(request.cookies.get(QUOTA_COOKIE)?.value);
  if (!quota.allowed) return error(429, LIMIT_MESSAGE);
  try {
    if (!(await consumeIpLimit(clientIp(request.headers)))) return error(429, LIMIT_MESSAGE);
  } catch (err) {
    // Sem como contar, não chama o modelo: falha fechada protege o saldo da IA.
    console.error("[assistente-busca] falha no limite por IP:", err);
    return error(503, "Assistente indisponível.");
  }

  // Conta mesmo quando falha: a chamada ao modelo pode ter gastado token.
  let response: NextResponse;
  try {
    response = NextResponse.json(await runSearchAssistant(parsed.data));
  } catch (err) {
    console.error("[assistente-busca] falha:", err);
    response = error(500, "Não foi possível responder agora.");
  }
  response.cookies.set(QUOTA_COOKIE, quota.cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/assistente-busca",
    maxAge: quota.maxAge,
  });
  return response;
}
