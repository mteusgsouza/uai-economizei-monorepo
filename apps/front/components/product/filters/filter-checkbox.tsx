"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Mono } from "@/components/ui/mono";

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  /** Quantos produtos caem neste filtro. */
  count?: number;
}

/**
 * Caixa de seleção quadrada — o sistema não arredonda nada, nem controles. A
 * contagem à direita alinha na coluna, como numa ficha.
 */
export function FilterCheckbox({ label, checked, onChange, count }: FilterCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm hover:text-accent-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "size-4 flex-none border-[1.5px] transition-colors",
          checked
            ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--color-canvas)]"
            : "border-divider",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <Mono className="text-ink/45">{count}</Mono>}
    </label>
  );
}
