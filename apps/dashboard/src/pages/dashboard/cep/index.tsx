import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCep } from "../../../hooks/use-cep";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { api } from "../../../lib/http-client";
import { formatPrice } from "../../../lib/format-price";

export default function CepPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ceps, isLoading, isError, error, refetch } = useCep();

  async function handleDelete(id: number, descricao: string) {
    if (!confirm(`Deletar "${descricao}"? Esta acao nao pode ser desfeita.`)) return;

    try {
      await api.delete(`/cep/${id}`);
      toast.success("CEP removido");
      queryClient.invalidateQueries({ queryKey: ["cep"] });
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
        <p className="text-steel">Erro ao carregar CEPs: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.005em] text-ink">
            CEP / Frete
          </h1>
          <p className="mt-1 text-steel">
            {ceps?.length ?? 0} faixa(s) de CEP cadastrada(s)
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/cep/new")}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nova Faixa de CEP
        </Button>
      </div>

      <div className="rounded-lg border bg-canvas overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">CEP Inicial</TableHead>
              <TableHead className="w-24">CEP Final</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead>Valor Frete</TableHead>
              <TableHead className="w-24">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!ceps || ceps.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-steel">
                  Nenhuma faixa de CEP cadastrada.
                </TableCell>
              </TableRow>
            )}
            {ceps?.map((cep) => (
              <TableRow key={cep.id}>
                <TableCell className="text-sm">
                  {String(cep.cepInicial).padStart(8, "0").replace(/(\d{5})(\d{3})/, "$1-$2")}
                </TableCell>
                <TableCell className="text-sm">
                  {String(cep.cepFinal).padStart(8, "0").replace(/(\d{5})(\d{3})/, "$1-$2")}
                </TableCell>
                <TableCell className="font-medium text-ink">{cep.descricao}</TableCell>
                <TableCell className="font-medium">{formatPrice(cep.valor)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/dashboard/cep/${cep.id}/edit`)}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cep.id, cep.descricao)}>
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
