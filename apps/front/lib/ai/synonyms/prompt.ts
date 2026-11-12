import type { SearchDoc } from "@/lib/search/types";

export const SYNONYMS_SYSTEM = `Você ajuda uma loja brasileira a melhorar a busca do site.
Sua tarefa: propor GRUPOS DE SINÔNIMOS — termos que um cliente digitaria para procurar o MESMO tipo de produto.

Regras:
- Responda em português do Brasil.
- Cada grupo tem pelo menos 2 termos (ex.: ["fone de ouvido", "headset", "headphone"]).
- Só proponha grupos relevantes para o catálogo informado.
- Não invente marcas nem modelos; use termos genéricos de tipo de produto.
- Não repita termos que já estão nos grupos cadastrados.
- Inclua variações regionais, anglicismos e abreviações comuns.
- Termos curtos, sem pontuação, em minúsculas.`;

/** Nomes únicos, marcas e categorias do catálogo + grupos já cadastrados. */
export function buildUserMessage(catalog: SearchDoc[], existingRows: string[]): string {
  const names = [...new Set(catalog.map((doc) => doc.name))];
  const brands = [...new Set(catalog.map((doc) => doc.brand).filter(Boolean))];
  const taxonomy = [...new Set(catalog.flatMap((doc) => doc.taxonomy))];

  return [
    `Categorias e subcategorias:\n${taxonomy.join("; ") || "(nenhuma)"}`,
    `Marcas:\n${brands.join("; ") || "(nenhuma)"}`,
    `Nomes de produtos:\n${names.join("\n")}`,
    `Grupos já cadastrados (não repita estes termos):\n${existingRows.join("\n") || "(nenhum)"}`,
    "Proponha novos grupos de sinônimos.",
  ].join("\n\n");
}
