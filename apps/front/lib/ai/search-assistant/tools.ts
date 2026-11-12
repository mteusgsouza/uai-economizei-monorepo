import type Anthropic from "@anthropic-ai/sdk";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { getSearchResults } from "@/lib/catalog/search-results";
import { getCategories, getSubcategoryCounts } from "@/lib/catalog/taxonomy";
import { canonicalSearch, hasSearchTerms } from "@/lib/search/normalize";
import type { Product } from "@/types/product";

export const MAX_ASSISTANT_PRODUCTS = 6;

/**
 * O que as tools deixaram para o servidor: os produtos da última busca com
 * resultado. É daqui — e nunca do texto do modelo — que saem os cartões.
 */
export interface ToolAccumulator {
  products: Product[];
}

/** Definições fixas (ordem e texto estáveis): o cache do prompt cobre tools + system. */
export const SEARCH_ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Busca produtos ativos no catálogo da loja pelo termo informado (tolerante a erro de digitação e sinônimos). Retorna até 6 produtos com nome, marca, categoria e preço. Use termos curtos: tipo do produto, marca ou modelo.",
    input_schema: {
      type: "object",
      properties: {
        term: { type: "string", description: "Termo de busca, ex.: 'fone bluetooth'." },
      },
      required: ["term"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "list_taxonomy",
    description:
      "Lista as categorias e subcategorias que têm produtos na loja, com a quantidade de cada uma. Use quando a busca não encontrar nada, para sugerir caminhos.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
    strict: true,
  },
];

function describeProduct(product: Product): string {
  const where = product.subcategoryTitle ?? product.category?.title ?? "sem categoria";
  const brand = product.brand?.name ?? "sem marca";
  return `- ${product.name} | marca: ${brand} | ${where} | ${formatPrice(product.value)}`;
}

async function searchProducts(input: unknown, acc: ToolAccumulator): Promise<string> {
  const term = typeof (input as { term?: unknown }).term === "string"
    ? (input as { term: string }).term.trim()
    : "";
  if (!term || !hasSearchTerms(term)) return "Termo vazio. Informe o tipo do produto ou a marca.";

  const result = await getSearchResults(
    { page: 1, limit: MAX_ASSISTANT_PRODUCTS },
    canonicalSearch(term),
  );
  if (result.docs.length === 0) return `Nenhum produto encontrado para "${term}".`;

  acc.products = result.docs.slice(0, MAX_ASSISTANT_PRODUCTS);
  return [
    `${result.totalDocs} produto(s) para "${term}"; os primeiros:`,
    ...acc.products.map(describeProduct),
  ].join("\n");
}

async function listTaxonomy(): Promise<string> {
  const [categories, counts] = await Promise.all([getCategories(), getSubcategoryCounts()]);
  const lines = categories.flatMap((category) => {
    const subs = category.subcategories
      .map((sub) => ({ title: sub.title, count: counts[sub.subcatSlug] ?? 0 }))
      .filter((sub) => sub.count > 0);
    if (subs.length === 0) return [];
    return [`${category.title}: ${subs.map((s) => `${s.title} (${s.count})`).join(", ")}`];
  });
  return lines.length ? lines.join("\n") : "A loja ainda não tem categorias com produtos.";
}

/** Executa uma tool; erro vira `tool_result` com `is_error`, nunca derruba o loop. */
export async function runTool(
  block: Anthropic.ToolUseBlock,
  acc: ToolAccumulator,
): Promise<Anthropic.ToolResultBlockParam> {
  try {
    const content =
      block.name === "search_products"
        ? await searchProducts(block.input, acc)
        : block.name === "list_taxonomy"
          ? await listTaxonomy()
          : `Ferramenta desconhecida: ${block.name}`;
    return { type: "tool_result", tool_use_id: block.id, content };
  } catch (err) {
    console.error(`[assistente-busca] falha na tool ${block.name}:`, err);
    return {
      type: "tool_result",
      tool_use_id: block.id,
      content: "Falha ao consultar o catálogo.",
      is_error: true,
    };
  }
}
