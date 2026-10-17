import type { ReactNode } from "react";

interface ProductShelfProps {
  title: string;
  /** Link ou botão alinhado à direita do título. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Faixa de produtos sob a ficha do produto: título à esquerda, ação à direita
 * e a grade de quatro colunas da vitrine. Serve aos relacionados (server) e aos
 * vistos recentemente (client), por isso não carrega estado nenhum.
 */
export function ProductShelf({ title, action, children }: ProductShelfProps) {
  return (
    <section className="mt-11">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-heading text-[22px] uppercase md:text-[26px]">{title}</h2>
        {action}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">{children}</div>
    </section>
  );
}
