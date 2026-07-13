import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { IconPlus, IconPencil, IconTrash, IconSearch } from "@tabler/icons-react";
import { api } from "../../../lib/http-client";
import { useBrands } from "../../../hooks/use-brands";

export default function BrandsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: brands, isLoading, isError, error, refetch } = useBrands({
    search: debouncedSearch || undefined,
  });

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deletar "${name}"? Esta acao nao pode ser desfeita.`)) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success("Marca removida");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-steel">Erro ao carregar marcas: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.005em] text-ink">Marcas</h1>
          <p className="mt-1 text-steel">{brands?.length ?? 0} marca(s) encontrada(s)</p>
        </div>
        <Button onClick={() => navigate("/dashboard/brands/new")}>
          <IconPlus className="h-4 w-4 mr-2" />Nova Marca
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel" />
          <Input
            placeholder="Buscar marcas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-canvas overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-24">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!brands || brands.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-steel">Nenhuma marca encontrada.</TableCell>
              </TableRow>
            )}
            {brands?.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="text-sm text-steel">{brand.id}</TableCell>
                <TableCell className="font-medium text-ink">{brand.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/dashboard/brands/${brand.id}/edit`)}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(brand.id, brand.name)}>
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
