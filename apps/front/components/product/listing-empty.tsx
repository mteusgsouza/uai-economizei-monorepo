import { EmptyState } from "@/components/ui/empty-state";

interface ListingEmptyProps {
  /** O termo buscado, quando a busca aconteceu. */
  searchTerm?: string;
  filtersActive: boolean;
}

/** O vazio da listagem: sem busca, culpa dos filtros; com busca, do termo. */
export function ListingEmpty({ searchTerm, filtersActive }: ListingEmptyProps) {
  if (!searchTerm) {
    return (
      <EmptyState
        title="Nada por aqui"
        description="Nenhum produto com esses filtros."
        actionLabel="Limpar filtros"
        actionHref="/produtos"
      />
    );
  }

  // Com filtros, limpar mantém o termo — talvez o filtro é que escondeu tudo.
  return (
    <EmptyState
      title={`Nada encontrado para “${searchTerm}”`}
      description="Confira a grafia ou tente um termo mais geral, como o tipo do produto ou a marca."
      actionLabel={filtersActive ? "Limpar filtros" : "Ver todos os produtos"}
      actionHref={filtersActive ? `/produtos?search=${encodeURIComponent(searchTerm)}` : "/produtos"}
    />
  );
}
