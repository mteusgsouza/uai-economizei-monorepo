import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { Mono } from "@/components/ui/mono";

interface AuthShellProps {
  /** A manchete do painel de aço, em linhas curtas. */
  headline: string[];
  pitch: string;
  /** Dois números que valem a pena mostrar antes de pedir e-mail. */
  stats?: { value: string; label: string }[];
  children: ReactNode;
}

/**
 * A tela partida de acesso: aço à esquerda com o argumento, papel à direita
 * com o formulário. É a única tela do site sem barra de navegação — quem
 * chega aqui tem uma tarefa só.
 *
 * No mobile o formulário não ganha moldura: a faixa de aço já separa as duas
 * partes, e um cartão dentro de uma tela estreita só rouba largura.
 */
export function AuthShell({ headline, pitch, stats = [], children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col bg-accent-900 px-4 pt-6 pb-7 text-on-dark lg:p-12">
        <Logo onDark size="responsive" />

        <div className="flex max-w-[440px] flex-1 flex-col justify-center">
          <h1 className="mt-5 mb-2.5 font-heading text-[34px] uppercase leading-none lg:mt-0 lg:mb-4 lg:text-[56px] lg:leading-[0.98]">
            {headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="text-sm opacity-75 lg:text-[15px]">{pitch}</p>

          {stats.length > 0 && (
            <div className="mt-9 hidden grid-cols-2 gap-5 border-t border-on-dark/25 pt-5 lg:grid">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading text-[28px] leading-none">{stat.value}</div>
                  <Mono as="div" className="opacity-70">
                    {stat.label}
                  </Mono>
                </div>
              ))}
            </div>
          )}
        </div>

        <Mono className="hidden opacity-60 lg:block">
          Ambiente seguro · dados criptografados
        </Mono>
      </div>

      <div className="px-4 pt-6 pb-8 lg:flex lg:items-center lg:justify-center lg:p-12">
        {/* A moldura só existe do desktop para cima. */}
        <div className="w-full lg:w-[400px] lg:border lg:border-divider lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
