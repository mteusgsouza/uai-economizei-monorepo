import Anthropic from "@anthropic-ai/sdk";

/**
 * Só importe daqui em código de servidor: a chave nunca vai para o client.
 *
 * Provedor: com `DEEPSEEK_API_KEY` definida, usa o endpoint da DeepSeek
 * compatível com a Messages API (mesmo SDK, mesmos formatos); senão, a Anthropic.
 * A DeepSeek ignora `cache_control`, `strict` e `is_error` e não tem saída estruturada.
 */
const deepseekKey = process.env.DEEPSEEK_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

export const AI_PROVIDER: "deepseek" | "anthropic" = deepseekKey ? "deepseek" : "anthropic";

export const AI_MODEL = AI_PROVIDER === "deepseek" ? "deepseek-flash" : "claude-haiku-5-5";

export const aiEnabled = Boolean(deepseekKey || anthropicKey);

let client: Anthropic | null = null;

/**
 * Cliente único. O `baseURL` e a chave são sempre explícitos porque o SDK também
 * honra `ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN`, que ferramentas de CLI
 * costumam definir na máquina — aí a chave vai para o lugar errado e volta 401.
 * Chave Anthropic sem workspace exige o header `anthropic-workspace-id`.
 */
export function getAnthropicClient(): Anthropic {
  if (client) return client;

  if (AI_PROVIDER === "deepseek") {
    client = new Anthropic({
      baseURL: "https://api.deepseek.com/anthropic",
      apiKey: deepseekKey,
      authToken: null,
    });
    return client;
  }

  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  client = new Anthropic({
    baseURL: "https://api.anthropic.com",
    apiKey: anthropicKey,
    authToken: null,
    defaultHeaders: workspaceId ? { "anthropic-workspace-id": workspaceId } : undefined,
  });
  return client;
}
