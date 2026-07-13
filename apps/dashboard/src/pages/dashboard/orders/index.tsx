import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOrdersAdmin } from "../../../hooks/use-orders-admin";
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
import { IconEye } from "@tabler/icons-react";
import { formatPrice } from "../../../lib/format-price";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  PREORDER: "Pre-venda",
};

const statusVariants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
  PREORDER: "outline",
};

export default function OrdersPage() {
  const navigate = useNavigate();

  const { data: orders, isLoading, isError, error, refetch } = useOrdersAdmin();

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
        <p className="text-steel">Erro ao carregar pedidos: {(error as Error).message}</p>
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
            Pedidos
          </h1>
          <p className="mt-1 text-steel">
            {orders?.length ?? 0} pedido(s) encontrado(s)
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-canvas overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-24">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!orders || orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-steel">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-sm text-steel">#{order.id}</TableCell>
                <TableCell>
                  <p className="font-medium text-ink">{order.customer.email}</p>
                  <p className="text-xs text-steel">
                    {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "-"}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[order.status] ?? "secondary"}>
                    {statusLabels[order.status] ?? order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{formatPrice(order.subtotal)}</TableCell>
                <TableCell className="text-sm text-steel">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/dashboard/orders/${order.id}`)}>
                      <IconEye className="h-4 w-4" />
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
