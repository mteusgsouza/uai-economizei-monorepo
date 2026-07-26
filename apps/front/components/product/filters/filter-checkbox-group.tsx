"use client";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import useHandleChangeQuery from "@/hooks/useHandleChangeQuery";

export interface FilterOption {
  key: string;
  label: string;
}

interface FilterCheckboxGroupProps {
  title: string;
  paramLabel: string;
  options: FilterOption[];
  activeKey?: string;
  idPrefix: string;
}

/** Grupo de checkboxes de filtro que grava a seleção na query string. */
export function FilterCheckboxGroup({
  title,
  paramLabel,
  options,
  activeKey,
  idPrefix,
}: FilterCheckboxGroupProps) {
  const handleChangeQuery = useHandleChangeQuery();

  if (options.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      <ScrollArea className="h-52 overflow-hidden">
        <div className="space-y-2 pr-3">
          {options.map((option) => (
            <label
              key={option.key}
              className="group flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={activeKey === option.key}
                onCheckedChange={(checked) =>
                  handleChangeQuery({
                    label: paramLabel,
                    value: checked ? option.key : "*",
                  })
                }
                id={`${idPrefix}-${option.key}`}
              />
              <span className="line-clamp-1 text-sm text-steel transition-colors group-hover:text-ink">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </ScrollArea>
      <Separator className="mt-4" />
    </div>
  );
}
