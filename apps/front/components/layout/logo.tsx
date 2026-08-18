import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

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
  /** Sobre a faixa de aço o "UAI" perde o acento e vira o próprio papel. */
  onDark?: boolean;
  /** Sem `href` vira só a marca — no rodapé e nos painéis, onde não é link. */
  href?: string | null;
  className?: string;
}

/**
 * A marca: um quadrado de aço com marcas de registro ao lado do nome em duas
 * linhas. É o único lugar do sistema onde o acento aparece como campo cheio
 * fora do botão primário.
 */
export function Logo({ size = "lg", onDark = false, href = "/", className }: LogoProps) {
  const s = SIZES[size];

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
        UAI
      </span>
      <span className="flex flex-col font-heading font-semibold uppercase leading-[0.92]">
        <span
          className={cn(
            "tracking-[0.32em]",
            s.kicker,
            onDark ? "opacity-65" : "text-accent-700",
          )}
        >
          UAI
        </span>
        <span className={cn("tracking-[0.03em]", s.word)}>Economizei</span>
      </span>
    </>
  );

  const classes = cn("flex items-center gap-2.5 text-inherit no-underline", className);

  if (!href) return <span className={classes}>{content}</span>;

  return (
    <Link href={href} className={classes} aria-label="UAI Economizei — início">
      {content}
    </Link>
  );
}
