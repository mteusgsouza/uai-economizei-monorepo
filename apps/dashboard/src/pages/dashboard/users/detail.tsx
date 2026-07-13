import { useParams, useNavigate } from "react-router-dom";
import { useUserDetail } from "../../../hooks/use-users-admin";
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
import { IconArrowLeft } from "@tabler/icons-react";
import { formatPrice } from "../../../lib/format-price";

const orderStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  PREORDER: "Pre-venda",
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error, refetch } = useUserDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-steel">
          {isError ? `Erro ao carregar usuario: ${(error as Error).message}` : "Usuario nao encontrado"}
        </p>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => refetch()}>Tentar novamente</Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/users")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/dashboard/users")} className="mb-6 -ml-2">
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Usuarios
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-steel">Nome</p>
                <p className="font-medium">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "-"}
                </p>
              </div>
              <div>
                <p className="text-steel">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-steel">Username</p>
                <p className="font-medium">{user.username || "-"}</p>
              </div>
              <div>
                <p className="text-steel">Telefone</p>
                <p className="font-medium">{user.phone || "-"}</p>
              </div>
              <div>
                <p className="text-steel">Verificado</p>
                <Badge variant={user.verifiedUser ? "default" : "secondary"} className="text-xs">
                  {user.verifiedUser ? "Sim" : "Nao"}
                </Badge>
              </div>
              <div>
                <p className="text-steel">Cadastro</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Enderecos ({user.addresses?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(!user.addresses || user.addresses.length === 0) && (
                <p className="text-sm text-steel">Nenhum endereco cadastrado.</p>
              )}
              {user.addresses?.map((addr) => (
                <div key={addr.id} className="rounded border p-3 text-sm space-y-0.5">
                  <p className="font-medium">
                    {addr.street}{addr.number ? `, ${addr.number}` : ""}
                  </p>
                  {addr.complement && <p className="text-steel">{addr.complement}</p>}
                  {addr.neighborhood && <p className="text-steel">{addr.neighborhood}</p>}
                  <p className="text-steel">
                    {addr.city} - {addr.state}
                  </p>
                  <p className="text-steel">CEP: {addr.postalCode}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos ({user.orders?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {(!user.orders || user.orders.length === 0) && (
                <p className="text-steel text-sm py-8 text-center">Nenhum pedido realizado.</p>
              )}
              {user.orders?.map((order) => (
                <div key={order.id} className="mb-4 last:mb-0 rounded border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">Pedido #{order.id}</p>
                      <p className="text-xs text-steel">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                      <Badge variant={order.status === "CANCELLED" ? "destructive" : "default"}>
                        {orderStatusLabels[order.status] ?? order.status}
                      </Badge>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Preco</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{item.product.name}</TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm">{formatPrice(item.unitPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
