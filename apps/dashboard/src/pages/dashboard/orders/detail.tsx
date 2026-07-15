import { useParams, useNavigate } from "react-router-dom";
import { useOrderDetail } from "../../../hooks/use-orders-admin";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Separator } from "@workspace/ui/components/separator";
import { IconArrowLeft } from "@tabler/icons-react";
import { formatPrice } from "@workspace/ui/lib/format-price";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  PREORDER: "Pre-venda",
};

const paymentMethodLabels: Record<string, string> = {
  CREDIT_CARD: "Cartao de Credito",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  PIX: "PIX",
  BOLETO: "Boleto",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  COMPLETED: "Concluido",
  FAILED: "Falhou",
  REFUNDED: "Reembolsado",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, error, refetch } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-steel">
          {isError ? `Erro ao carregar pedido: ${(error as Error).message}` : "Pedido nao encontrado"}
        </p>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => refetch()}>Tentar novamente</Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/orders")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/dashboard/orders")} className="mb-6 -ml-2">
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Pedidos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pedido #{order.id}</CardTitle>
                <p className="text-sm text-steel mt-1">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge variant={order.status === "CANCELLED" ? "destructive" : "default"} className="text-sm px-3 py-1">
                {statusLabels[order.status] ?? order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preco Unit.</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.productMainImg}
                            alt={item.product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <span className="font-medium">{item.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-steel">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-steel">Frete</span>
                    <span>{order.retiraBalcao ? "Retirada no local" : formatPrice(order.cepValue)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.subtotal + (order.retiraBalcao ? 0 : order.cepValue))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side info */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">
                {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "N/A"}
              </p>
              <p className="text-steel">{order.customer.email}</p>
              {order.customer.phone && <p className="text-steel">{order.customer.phone}</p>}
            </CardContent>
          </Card>

          {/* Address */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Endereco de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-0.5">
                <p>{order.address.street}{order.address.number ? `, ${order.address.number}` : ""}</p>
                <p className="text-steel">
                  {order.address.city} - {order.address.state}
                </p>
                <p className="text-steel">CEP: {order.address.postalCode}</p>
              </CardContent>
            </Card>
          )}

          {order.retiraBalcao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Retirada</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Retirada no Balcao</Badge>
              </CardContent>
            </Card>
          )}

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.payments?.length === 0 && (
                <p className="text-sm text-steel">Nenhum pagamento registrado.</p>
              )}
              {order.payments?.map((payment) => (
                <div key={payment.id} className="rounded border p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-steel">Metodo</span>
                    <span className="font-medium">{paymentMethodLabels[payment.method] ?? payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Status</span>
                    <Badge variant="secondary" className="text-xs">
                      {paymentStatusLabels[payment.status] ?? payment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Valor</span>
                    <span className="font-medium">{formatPrice(payment.amount)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
