"use client";

import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { useStoreSettings } from "@/lib/store-settings-context";
import { storeName, storeWordmark } from "@/lib/store-identity";

const SIZES = {
  sm: { mark: "size-8 text-[15px]", kicker: "text-[9px]", word: "text-[17px]" },
  md: { mark: "size-[34px] text-[15px]", kicker: "text-[9px]", word: "text-[18px]" },
  lg: { mark: "size-[42px] text-[19px]", kicker: "text-[12px]", word: "text-[22px]" },
  /** Cresce de `sm` para `lg` no desktop — a tela de acesso usa os dois. */
  responsive: {
    mark: "size-8 text-[15px] lg:size-[42px] lg:text-[19px]",
    kicker: "text-[9px] lg:text-[12px]",
    word: "text-[17px] lg:text-[22px]",
  },
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  /** Sobre a faixa de aço a sigla perde o acento e vira o próprio papel. */
  onDark?: boolean;
  /** Sem `href` vira só a marca — no rodapé e nos painéis, onde não é link. */
  href?: string | null;
  className?: string;
}

/**
 * A marca: um quadrado de aço com a sigla da loja ao lado do nome em duas
 * linhas. É o único lugar do sistema onde o acento aparece como campo cheio
 * fora do botão primário.
 *
 * O texto vem das Configurações da loja — é o que muda entre dois deploys do
 * mesmo código. Client component porque a barra, a gaveta e as telas de acesso
 * e de checkout já são client, e passar o nome por props até lá significaria
 * atravessar quatro árvores para desenhar uma palavra.
 */
export function Logo({ size = "lg", onDark = false, href = "/", className }: LogoProps) {
  const s = SIZES[size];
  const settings = useStoreSettings();
  const { mark, word } = storeWordmark(settings.identity);
  const name = storeName(settings.identity);

  const content = (
    <>
      <span
        className={cn(
          // `rounded-xs` lê `--radius-xs`: reto por padrão, mas acompanha a
          // opção "Cantos" das Configurações da loja como os demais objetos.
          "grid flex-none place-items-center rounded-xs bg-primary font-heading font-semibold leading-none tracking-[0.02em] text-canvas",
          s.mark,
        )}
      >
        {mark}
      </span>
      <span className="flex flex-col font-heading font-semibold uppercase leading-[0.92]">
        <span
          className={cn(
            "tracking-[0.32em]",
            s.kicker,
            onDark ? "opacity-65" : "text-accent-700",
          )}
        >
          {mark}
        </span>
        <span className={cn("tracking-[0.03em]", s.word)}>{word}</span>
      </span>
    </>
  );

  const classes = cn("flex items-center gap-2.5 text-inherit no-underline", className);

  if (!href) return <span className={classes}>{content}</span>;

  return (
    <Link href={href} className={classes} aria-label={`${name} — início`}>
      {content}
    </Link>
  );
}
