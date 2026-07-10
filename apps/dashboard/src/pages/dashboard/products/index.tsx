import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/http-client";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { formatPrice } from "../../../lib/format-price";

interface ProductImage {
  name: string;
  url: string;
}

interface ProductListItem {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  isNew: string | null;
  value: number;
  stock: number;
  productMainImg: string;
  productImages: ProductImage[];
  brand: { id: number; name: string };
  category: { id: number; title: string; categorySlug: string };
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products"] as const,
    queryFn: () => api.get<ProductListItem[]>("/products"),
    staleTime: 5 * 60 * 1000,
  });

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deletar "${name}"? Esta acao nao pode ser desfeita.`)) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Produto removido");
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
        <p className="text-steel">Erro ao carregar produtos: {(error as Error).message}</p>
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
            Produtos
          </h1>
          <p className="mt-1 text-steel">
            {products?.length ?? 0} produto(s) encontrado(s)
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/products/new")}>
          <IconPlus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="rounded-lg border bg-canvas overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Img</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preco</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="w-24">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-steel">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.productMainImg}
                    alt={product.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-ink text-ellipsis line-clamp-1 max-w-md">{product.name}</p>
                   
                </TableCell>
                <TableCell className="font-medium">{formatPrice(product.value)}</TableCell>
                <TableCell className="text-sm text-steel">{product.brand.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {product.category.title}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{product.stock}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(product.id, product.name)}>
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
