import { SiteShell } from "@/components/layout/site-shell";

/**
 * Só o carrinho usa o chrome completo. As etapas seguintes do checkout têm o
 * próprio cabeçalho enxuto, por isso este layout fica no grupo de rota em vez
 * de cobrir `/carrinho/*` inteiro.
 */
export default function CarrinhoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell showBenefits={false}>{children}</SiteShell>;
}
