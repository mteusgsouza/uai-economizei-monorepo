"use client";

import { cn } from "@workspace/ui/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Ocupa a largura toda, dividindo as células por igual. */
  block?: boolean;
  "aria-label"?: string;
}

/**
 * Controle segmentado: as opções dividem uma moldura só, com fio separando as
 * células e a ativa preenchida de aço. É como o sistema pede escolha única —
 * ordenação, abas, filtros de status.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  block = false,
  "aria-label": ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        // `cgroup`: a moldura é uma peça só. Quem arredonda é ela, não cada
        // célula — ver a regra de grupos em brand.css.
        "cgroup inline-flex items-stretch border border-divider",
        block && "w-full",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-[38px] items-center justify-center px-3 text-[13px] leading-none transition-colors cursor-pointer",
              "border-divider not-first:border-l",
              block && "flex-1",
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent-100",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
