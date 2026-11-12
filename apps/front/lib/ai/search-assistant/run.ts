import type Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL, getAnthropicClient } from "@/lib/ai/anthropic";
import type { Product } from "@/types/product";
import { FALLBACK_REPLY, SEARCH_ASSISTANT_SYSTEM } from "./prompt";
import { runTool, SEARCH_ASSISTANT_TOOLS, type ToolAccumulator } from "./tools";

const MAX_TOOL_ROUNDS = 4;
const MAX_TOKENS = 700;

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SearchAssistantInput {
  /** O termo que a busca do site não resolveu. */
  term: string;
  messages: AssistantTurn[];
}

export interface SearchAssistantReply {
  message: string;
  products: Product[];
}

// Prefixo estável com breakpoint: tools → system. O histórico (volátil) vem depois.
const SYSTEM: Anthropic.TextBlockParam[] = [
  { type: "text", text: SEARCH_ASSISTANT_SYSTEM, cache_control: { type: "ephemeral" } },
];

/** O termo da busca vai junto da primeira fala do cliente, não no system (cache). */
function toMessages({ term, messages }: SearchAssistantInput): Anthropic.MessageParam[] {
  return messages.map((turn, index) =>
    index === 0 && turn.role === "user"
      ? { role: "user", content: `[O cliente buscou no site: "${term}"]\n${turn.content}` }
      : { role: turn.role, content: turn.content },
  );
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

/**
 * Loop manual de tool use. O modelo só conversa e chama tools; os produtos
 * devolvidos são os da última busca com resultado, acumulados no servidor.
 */
export async function runSearchAssistant(input: SearchAssistantInput): Promise<SearchAssistantReply> {
  const client = getAnthropicClient();
  const acc: ToolAccumulator = { products: [] };
  const messages = toMessages(input);

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      tools: SEARCH_ASSISTANT_TOOLS,
      tool_choice: { type: "auto" },
      output_config: { effort: "low" },
      messages,
    });

    if (response.stop_reason === "refusal") {
      return { message: FALLBACK_REPLY, products: [] };
    }

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (response.stop_reason !== "tool_use" || toolUses.length === 0 || round === MAX_TOOL_ROUNDS) {
      return { message: textOf(response) || FALLBACK_REPLY, products: acc.products };
    }

    // Conteúdo inteiro de volta (thinking incluso) e todos os resultados numa mensagem só.
    messages.push({ role: "assistant", content: response.content });
    const results = await Promise.all(toolUses.map((block) => runTool(block, acc)));
    messages.push({ role: "user", content: results });
  }

  return { message: FALLBACK_REPLY, products: acc.products };
}
