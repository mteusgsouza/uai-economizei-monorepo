"use client";

import type { ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Mono } from "@/components/ui/mono";
import { cn } from "@workspace/ui/lib/utils";

export interface ChatShellProps {
  /** `floating`: card fixo no canto (largura total no mobile). `inline`: card no fluxo da página. */
  variant: "floating" | "inline";
  title: string;
  children: ReactNode;
  /** Mostra o botão de fechar no cabeçalho. */
  onClose?: () => void;
  /** Mostra o botão de voltar no cabeçalho. */
  onBack?: () => void;
  /** Rodapé fixo (ex.: campo de mensagem). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Moldura de chat compartilhada pelo widget de ajuda e pelo assistente de busca:
 * cabeçalho, área rolável e rodapé opcional.
 */
export function ChatShell({
  variant,
  title,
  children,
  onClose,
  onBack,
  footer,
  className,
}: ChatShellProps) {
  const floating = variant === "floating";

  return (
    <section
      aria-label={title}
      className={cn(
        // Borda na cor do cabeçalho: o fio translúcido do .blueprint virava um
        // halo claro em volta da faixa escura.
        "blueprint flex flex-col overflow-hidden border-ink bg-canvas text-ink shadow-[var(--shadow-lg)]",
        floating
          ? "fixed inset-x-3 bottom-20 z-40 max-h-[min(34rem,75dvh)] md:inset-x-auto md:right-4 md:w-[22rem]"
          : "w-full",
        className,
      )}
    >
      <header className="flex items-center gap-2 bg-ink px-4 py-3 text-on-dark">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Voltar"
            className="-ml-2 size-8 text-on-dark hover:bg-on-dark/10 hover:text-on-dark"
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <Mono as="div" className="text-on-dark/60">
            Uai Economizei
          </Mono>
          <h2 className="truncate font-heading text-xl leading-tight">{title}</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 size-8 text-on-dark hover:bg-on-dark/10 hover:text-on-dark"
          >
            <X />
          </Button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">{children}</div>

      {footer && <footer className="border-t border-divider bg-surface p-3">{footer}</footer>}
    </section>
  );
}
