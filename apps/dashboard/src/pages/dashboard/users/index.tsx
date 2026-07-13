import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUsersAdmin } from "../../../hooks/use-users-admin";
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

export default function UsersPage() {
  const navigate = useNavigate();

  const { data: users, isLoading, isError, error, refetch } = useUsersAdmin();

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
        <p className="text-steel">Erro ao carregar usuarios: {(error as Error).message}</p>
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
            Usuarios
          </h1>
          <p className="mt-1 text-steel">
            {users?.length ?? 0} usuario(s) encontrado(s)
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-canvas overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Verificado</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-24">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-steel">
                  Nenhum usuario encontrado.
                </TableCell>
              </TableRow>
            )}
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="font-medium text-ink">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "-"}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-steel">{user.email}</TableCell>
                <TableCell className="text-sm text-steel">{user.phone || "-"}</TableCell>
                <TableCell>
                  <Badge variant={user.verifiedUser ? "default" : "secondary"} className="text-xs">
                    {user.verifiedUser ? "Sim" : "Nao"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{user._count?.orders ?? 0}</TableCell>
                <TableCell className="text-sm text-steel">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/dashboard/users/${user.id}`)}>
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
