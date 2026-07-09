import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/http-client";
import { ProductForm } from "../../../components/product-form";

interface ProductFull {
  id: number;
  name: string;
  price: number;
  image: string;
  categories: string[];
  authors: string[];
  tags: string[];
  genre: string | null;
  type_of_work: string | null;
  label: string;
  publication_date: string;
  url: string;
  description: string | null;
  preview_images: string[];
  preview_videos: { id: number; url: string }[];
  publisher: { id: number; name: string; category: string };
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", productId] as const,
    queryFn: () => api.get<ProductFull>(`/products/${productId}`),
    enabled: !isNaN(productId),
  });

  const formData = product
    ? {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categories: product.categories,
        authors: product.authors,
        tags: product.tags,
        genre: product.genre,
        type_of_work: product.type_of_work,
        publisherId: product.publisher.id,
        publication_date: product.publication_date,
        description: product.description,
        url: product.url,
        preview_images: product.preview_images,
        preview_videos: product.preview_videos,
      }
    : null;

  return <ProductForm key={id} product={formData} isLoading={isLoading} />;
}
