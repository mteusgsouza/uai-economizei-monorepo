/** Os links fixos da barra, ao lado do índice de categorias. */
export const SECONDARY_LINKS = [
  { href: "/mais-vendidos", label: "Mais vendidos" },
  { href: "/novidades", label: "Novidades" },
  { href: "/marcas", label: "Marcas" },
] as const;

export const FOOTER_LINKS = {
  navegar: [
    { href: "/categorias", label: "Categorias" },
    { href: "/mais-vendidos", label: "Mais vendidos" },
    { href: "/novidades", label: "Novidades" },
    { href: "/marcas", label: "Marcas" },
  ],
  ajuda: [
    { href: "/contato", label: "Contato" },
    { href: "/faq", label: "FAQ" },
    { href: "/entregas", label: "Entregas" },
    { href: "/devolucoes", label: "Devoluções" },
    { href: "/pedidos", label: "Rastrear pedido" },
  ],
  sobre: [
    { href: "/sobre", label: "Quem somos" },
    { href: "/privacidade", label: "Privacidade" },
    { href: "/termos", label: "Termos de uso" },
  ],
} as const;
