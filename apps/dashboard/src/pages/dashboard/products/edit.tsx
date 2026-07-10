import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/http-client";
import { ProductForm } from "../../../components/product-form";

interface ProductImage {
  name: string;
  url: string;
}

interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  value: number;
  paidPrice?: number;
  stock: number;
  productMainImg: string;
  productImages: ProductImage[];
  brand: { id: number; name: string };
  category: { id: number; title: string; categorySlug: string };
  active: boolean;
  isNew: string | null;
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", productId] as const,
    queryFn: () => api.get<ProductResponse>(`/products/${productId}`),
    enabled: !isNaN(productId),
  });

  return <ProductForm key={id} product={product ?? null} isLoading={isLoading} />;
}
