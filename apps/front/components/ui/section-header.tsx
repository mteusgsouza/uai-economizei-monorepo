import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Mono } from "@/components/ui/mono";

interface SectionHeaderProps {
  /** O número da seção na malha: "02 / Índice". */
  kicker?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Cabeçalho de seção: numeração mono no acento, título condensado em caixa-alta
 * e o link de "ver tudo" alinhado pela base.
 */
export function SectionHeader({
  kicker,
  title,
  href,
  linkLabel = "Ver todos",
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && <Mono className="text-accent-700">{kicker}</Mono>}
        <h3 className="mt-1.5 font-heading text-2xl uppercase leading-none md:text-[32px]">
          {title}
        </h3>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex flex-none items-center gap-1.5 text-sm text-primary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-[15px]" />
        </Link>
      )}
    </div>
  );
}
