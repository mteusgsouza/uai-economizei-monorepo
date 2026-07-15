import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconArrowsSort,
  IconRefresh,
  IconPhoto,
} from "@tabler/icons-react";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { useProductsAdmin, type ProductFilters } from "../../../hooks/use-products-admin";
import { useBrands } from "../../../hooks/use-brands";
import { useCategories } from "../../../hooks/use-categories";
import { api } from "../../../lib/http-client";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Mais recentes" },
  { value: "createdAt-asc", label: "Mais antigos" },
  { value: "name-asc", label: "Nome A-Z" },
  { value: "name-desc", label: "Nome Z-A" },
  { value: "value-asc", label: "Menor preço" },
  { value: "value-desc", label: "Maior preço" },
  { value: "stock-asc", label: "Menor estoque" },
  { value: "stock-desc", label: "Maior estoque" },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [brandId, setBrandId] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sortValue, setSortValue] = useState("createdAt-desc");
  const [syncLoading, setSyncLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build filters object
  const filters: ProductFilters = useMemo(() => {
    const [sortBy, sortOrder] = sortValue.split("-");
    return {
      search: debouncedSearch || undefined,
      brandId: brandId !== "all" ? Number(brandId) : undefined,
      categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
      sortBy,
      sortOrder,
    };
  }, [debouncedSearch, brandId, categoryId, sortValue]);

  const { data: products, isLoading, isError, error, refetch } = useProductsAdmin(filters);
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

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

  async function handleSyncPrices() {
    setSyncLoading(true);
    try {
      const result = await api.post<{
        updated: number;
        notFound: number;
        errors: number;
      }>("/products/sync-prices");
      toast.success(
        `Preços sincronizados: ${result.updated} atualizado(s), ${result.notFound} não encontrado(s), ${result.errors} erro(s)`
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSyncLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.005em] text-ink">
            Produtos
          </h1>
          <p className="mt-1 text-steel">
            {products?.length ?? 0} produto(s) encontrado(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSyncPrices}
            disabled={syncLoading}
          >
            <IconRefresh
              className={`h-4 w-4 mr-2 ${syncLoading ? "animate-spin" : ""}`}
            />
            {syncLoading ? "Sincronizando..." : "Sincronizar Preços"}
          </Button>
          <Button onClick={() => navigate("/dashboard/products/new")}>
            <IconPlus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel" />
          <Input
            placeholder="Buscar produtos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={brandId} onValueChange={setBrandId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands?.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="w-[180px]">
            <IconArrowsSort className="h-4 w-4 mr-2 text-steel" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-steel">
            Erro ao carregar produtos: {(error as Error).message}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
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
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-steel"
                  >
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.productMainImg ? (
                      <img
                        src={product.productMainImg}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-surface flex items-center justify-center">
                        <IconPhoto className="h-5 w-5 text-stone" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-ink text-ellipsis line-clamp-1 max-w-md">
                      {product.name}
                    </p>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(product.value)}
                  </TableCell>
                  <TableCell className="text-sm text-steel">
                    {product.brand.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {product.category.title}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/products/${product.id}/edit`,
                          )
                        }
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          handleDelete(product.id, product.name)
                        }
                      >
                        <IconTrash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
