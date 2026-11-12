import Anthropic from "@anthropic-ai/sdk";

/** Só importe daqui em código de servidor: a chave nunca vai para o client. */
export const AI_MODEL = "claude-haiku-5-5";

export const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;

/**
 * Cliente único; o SDK lê `ANTHROPIC_API_KEY` do ambiente. O `baseURL` é fixo
 * porque o SDK também honra `ANTHROPIC_BASE_URL`, que ferramentas de CLI costumam
 * definir na máquina (ex.: apontando para outro provedor) — aí a chave da loja
 * vai para o lugar errado e volta 401. Pelo mesmo motivo o `authToken` é zerado.
 * Chave sem workspace exige o header `anthropic-workspace-id`.
 */
export function getAnthropicClient(): Anthropic {
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  client ??= new Anthropic({
    baseURL: "https://api.anthropic.com",
    authToken: null,
    defaultHeaders: workspaceId ? { "anthropic-workspace-id": workspaceId } : undefined,
  });
  return client;
}
