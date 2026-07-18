import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersAdmin } from "../../../hooks/use-users-admin";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { IconEye, IconSearch, IconArrowsSort } from "@tabler/icons-react";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Mais recentes" },
  { value: "createdAt-asc", label: "Mais antigos" },
  { value: "firstName-asc", label: "Nome A-Z" },
  { value: "firstName-desc", label: "Nome Z-A" },
];

export default function UsersPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortValue, setSortValue] = useState("createdAt-desc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = useMemo(() => {
    const [sortBy, sortOrder] = sortValue.split("-");
    return {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    };
  }, [debouncedSearch, sortValue]);

  const { data: users, isLoading, isError, error, refetch } = useUsersAdmin(filters);

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Spinner /></div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-steel">Erro ao carregar usuarios: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.005em] text-ink">Usuarios</h1>
          <p className="mt-1 text-steel">{users?.length ?? 0} usuario(s) encontrado(s)</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="w-[180px]">
            <IconArrowsSort className="h-4 w-4 mr-2 text-steel" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableCell colSpan={7} className="text-center py-12 text-steel">Nenhum usuario encontrado.</TableCell>
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
                <TableCell className="text-sm text-steel">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell>
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
