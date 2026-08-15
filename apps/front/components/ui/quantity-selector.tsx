import { cn } from "@workspace/ui/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

const PADDING = {
  sm: { step: "px-2 py-0.5", value: "px-2.5 py-0.5" },
  md: { step: "px-2.5 py-1", value: "px-3 py-1" },
  lg: { step: "px-3 py-2", value: "px-4 py-2" },
} as const;

/**
 * Controle segmentado de quantidade: − | n | + numa moldura só, com fio
 * separando as células. Usado no carrinho e na página de produto.
 *
 * Estados: no mínimo o − desabilita; no máximo, o +.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = "md",
}: QuantitySelectorProps) {
  const pad = PADDING[size];
  const stepClass = cn(
    "inline-flex items-center justify-center text-[13px] leading-none transition-colors",
    "hover:bg-accent-100 disabled:pointer-events-none disabled:opacity-45",
    pad.step,
  );

  return (
    <div className="inline-flex items-stretch border border-divider">
      <button
        type="button"
        className={stepClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span
        className={cn(
          "inline-flex items-center justify-center border-x border-divider text-[13px] tabular-nums",
          pad.value,
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={stepClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
