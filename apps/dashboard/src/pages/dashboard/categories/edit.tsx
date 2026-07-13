import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/http-client";
import { CategoryForm } from "../../../components/category-form";
import { Spinner } from "@workspace/ui/components/spinner";

interface Subcategory {
  id: number;
  title: string;
  subcatSlug: string;
}

interface Category {
  id: number;
  title: string;
  categorySlug: string;
  subcategories: Subcategory[];
}

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: category, isLoading } = useQuery({
    queryKey: ["categories", id] as const,
    queryFn: () => api.get<Category>(`/categories/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return <CategoryForm category={category ?? null} />;
}
