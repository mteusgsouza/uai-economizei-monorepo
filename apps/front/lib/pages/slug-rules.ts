/**
 * Endereços que já são telas da loja. Uma página do CMS com um deles nunca
 * apareceria — a rota própria ganha do `/[slug]` —, então o admin recusa.
 */
export const RESERVED_SLUGS: readonly string[] = [
  "admin", "api", "bff", "carrinho", "categorias", "conta", "forgot-password",
  "login", "mais-vendidos", "marcas", "novidades", "pedidos", "posts", "produtos",
  "register", "reset-password", "wishlist",
];

const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** O que há de errado com o endereço, em português de gente; `null` se está ok. */
export function slugProblem(slug: string | null | undefined): string | null {
  const value = slug?.trim() ?? "";
  if (!value) return "Informe o endereço da página.";
  if (!SLUG_FORMAT.test(value)) {
    return "Use só letras minúsculas, números e hífens, sem espaço nem acento (ex.: trocas-e-devolucoes).";
  }
  if (RESERVED_SLUGS.includes(value)) {
    return `"${value}" já é uma tela da loja. Escolha outro endereço.`;
  }
  return null;
}
