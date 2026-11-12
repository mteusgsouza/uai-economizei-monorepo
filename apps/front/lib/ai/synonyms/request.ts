import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import { AI_MODEL, AI_PROVIDER, getAnthropicClient } from "@/lib/ai/anthropic";
import type { SearchDoc } from "@/lib/search/types";
import { buildUserMessage, SYNONYMS_SYSTEM } from "./prompt";

const GroupsSchema = z.object({ groups: z.array(z.array(z.string())) });

const MAX_TOKENS = 4000;

/** Sem saída estruturada (DeepSeek), o formato vai no prompt e a resposta é validada aqui. */
const JSON_INSTRUCTION =
  'Responda SOMENTE com JSON válido, sem texto antes ou depois, no formato {"groups": [["termo", "sinônimo"], ...]}.';

export type SynonymRequestResult = { ok: true; groups: string[][] } | { ok: false; refused: true };

/**
 * Extrai os grupos de uma resposta em texto: tolera cerca de código e texto em
 * volta pegando do primeiro `{` ao último `}`. Ilegível → nenhum grupo.
 */
export function parseGroupsJson(text: string): string[][] {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return [];
  try {
    const parsed = GroupsSchema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data.groups : [];
  } catch {
    return [];
  }
}

async function requestStructured(user: string): Promise<SynonymRequestResult> {
  const response = await getAnthropicClient().messages.parse({
    model: AI_MODEL,
    max_tokens: MAX_TOKENS,
    system: SYNONYMS_SYSTEM,
    messages: [{ role: "user", content: user }],
    output_config: { effort: "low", format: zodOutputFormat(GroupsSchema) },
  });
  if (response.stop_reason === "refusal") return { ok: false, refused: true };
  return { ok: true, groups: response.parsed_output?.groups ?? [] };
}

async function requestJsonText(user: string): Promise<SynonymRequestResult> {
  const response = await getAnthropicClient().messages.create({
    model: AI_MODEL,
    max_tokens: MAX_TOKENS,
    system: `${SYNONYMS_SYSTEM}\n\n${JSON_INSTRUCTION}`,
    messages: [{ role: "user", content: user }],
    output_config: { effort: "low" },
  });
  if (response.stop_reason === "refusal") return { ok: false, refused: true };
  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("\n");
  return { ok: true, groups: parseGroupsJson(text) };
}

/** Pede grupos de sinônimos para um lote do catálogo, no formato que o provedor suporta. */
export function requestSynonymGroups(
  batch: SearchDoc[],
  existingRows: string[],
): Promise<SynonymRequestResult> {
  const user = buildUserMessage(batch, existingRows);
  return AI_PROVIDER === "deepseek" ? requestJsonText(user) : requestStructured(user);
}
