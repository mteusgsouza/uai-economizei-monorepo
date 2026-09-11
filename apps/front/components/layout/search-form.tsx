"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

export interface SearchFieldProps {
  className?: string;
  /** O botão some no menu mobile, onde o Enter já basta. */
  withButton?: boolean;
  onSubmitted?: () => void;
}

interface SearchFormProps extends SearchFieldProps {
  /** O termo com que o campo abre — o que está na URL. */
  initialTerm: string;
}

/** O formulário da busca — leva para /produtos com o termo na query. */
export function SearchForm({
  className,
  withButton = false,
  onSubmitted,
  initialTerm,
}: SearchFormProps) {
  const router = useRouter();
  const [term, setTerm] = useState(initialTerm);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    router.push(`/produtos?search=${encodeURIComponent(query)}`);
    onSubmitted?.();
  }

  return (
    <form onSubmit={submit} className={cn("flex min-w-0 items-center gap-2", className)}>
      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Buscar produto, marca ou código"
        aria-label="Buscar no catálogo"
      />
      {withButton && (
        <Button type="submit" variant="outline" size="icon" aria-label="Buscar">
          <Search className="size-[17px]" />
        </Button>
      )}
    </form>
  );
}
