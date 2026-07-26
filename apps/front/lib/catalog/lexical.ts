interface LexicalNode {
  type?: string;
  text?: string;
  children?: LexicalNode[];
}

interface LexicalRoot {
  root?: { children?: LexicalNode[] };
}

/**
 * Converte richText Lexical do Payload para HTML simples.
 * Mesmo comportamento do conversor legado da API Nest: parágrafos e headings,
 * preservando texto que já é HTML.
 */
export function lexicalToHtml(input: unknown): string {
  if (!input) return "";
  if (typeof input === "string") return input;

  const root = (input as LexicalRoot).root;
  const children = root?.children ?? (input as LexicalNode[]);

  if (!Array.isArray(children)) return "";

  return children
    .map((node) => {
      if (node.type === "paragraph" || node.type === "heading") {
        const text = (node.children ?? [])
          .map((c) => String(c.text ?? ""))
          .join("");
        if (text.startsWith("<")) return text;
        return node.type === "heading" ? `<h3>${text}</h3>` : `<p>${text}</p>`;
      }
      return "";
    })
    .join("\n");
}
