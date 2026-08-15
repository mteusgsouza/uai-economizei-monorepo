"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

interface SearchFieldProps {
  className?: string;
  /** O botão some no menu mobile, onde o Enter já basta. */
  withButton?: boolean;
  onSubmitted?: () => void;
}

/** Busca do catálogo — leva para /produtos com o termo na query. */
export function SearchField({
  className,
  withButton = false,
  onSubmitted,
}: SearchFieldProps) {
  const router = useRouter();
  const [term, setTerm] = useState("");

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
