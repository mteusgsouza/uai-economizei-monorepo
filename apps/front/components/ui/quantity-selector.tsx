import { Minus, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

/**
 * Reusable quantity stepper (+/-) used in cart items and product detail.
 *
 * States:
 * - normal: shows current quantity with +/- buttons
 * - at min: minus button disabled
 * - at max: plus button disabled
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = "md",
}: QuantitySelectorProps) {
  const isSm = size === "sm";

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-hairline bg-canvas ${
        isSm ? "p-0.5" : "p-1"
      }`}
    >
      <Button
        variant="ghost"
        size={isSm ? "icon-xs" : "icon-sm"}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className={`rounded-full text-ink hover:bg-surface ${
          isSm ? "" : "h-9 w-9"
        }`}
      >
        <Minus className={isSm ? "h-3 w-3" : "h-4 w-4"} />
      </Button>
      <span
        className={`min-w-[2rem] text-center font-medium tabular-nums text-ink ${
          isSm ? "text-sm" : "text-base"
        }`}
      >
        {value}
      </span>
      <Button
        variant="ghost"
        size={isSm ? "icon-xs" : "icon-sm"}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className={`rounded-full text-ink hover:bg-surface ${
          isSm ? "" : "h-9 w-9"
        }`}
      >
        <Plus className={isSm ? "h-3 w-3" : "h-4 w-4"} />
      </Button>
    </div>
  );
}
