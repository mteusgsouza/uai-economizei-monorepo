import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/http-client";
import { BrandForm } from "../../../components/brand-form";
import { Spinner } from "@workspace/ui/components/spinner";

export default function BrandEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: brand, isLoading } = useQuery({
    queryKey: ["brands", id] as const,
    queryFn: () => api.get<{ id: number; name: string }>(`/brands/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return <BrandForm brand={brand ?? null} />;
}
