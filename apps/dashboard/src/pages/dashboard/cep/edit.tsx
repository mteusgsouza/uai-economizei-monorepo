import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/http-client";
import { CepForm } from "../../../components/cep-form";
import { Spinner } from "@workspace/ui/components/spinner";

interface CepData {
  id: number;
  cepInicial: number;
  cepFinal: number;
  descricao: string;
  valor: number;
}

export default function CepEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: cep, isLoading } = useQuery({
    queryKey: ["cep", id] as const,
    queryFn: () => api.get<CepData>(`/cep/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return <CepForm cep={cep ?? null} />;
}
