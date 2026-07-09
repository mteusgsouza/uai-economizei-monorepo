import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/http-client";
import { usePostsAdmin } from "../../../hooks/use-posts-admin";
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

export default function PostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: posts, isLoading, isError, error, refetch } = usePostsAdmin();

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Deletar "${title}"? Esta acao nao pode ser desfeita.`)) return;

    try {
      await api.delete(`/posts/${id}`);
      toast.success("Post removido");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
        <p className="text-steel">Erro ao carregar posts: {(error as Error).message}</p>
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
            Posts
          </h1>
          <p className="mt-1 text-steel">
            {posts?.length ?? 0} post(s) encontrado(s)
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/posts/new")}>
          <IconPlus className="h-4 w-4 mr-2" />
          Novo Post
        </Button>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-24">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!posts || posts.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-steel">
                  Nenhum post encontrado.
                </TableCell>
              </TableRow>
            )}
            {posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium text-ink">{post.title}</TableCell>
                <TableCell className="text-sm text-steel">{post.slug}</TableCell>
                <TableCell>
                  <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                    {post.published ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-steel">
                  {post.author.firstName
                    ? `${post.author.firstName} ${post.author.lastName ?? ""}`.trim()
                    : post.author.email}
                </TableCell>
                <TableCell className="text-sm text-steel">
                  {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/dashboard/posts/${post.id}/edit`)}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(post.id, post.title)}>
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
