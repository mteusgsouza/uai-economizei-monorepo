import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";
import { useAuth } from "../contexts/use-auth";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import type { Post } from "../hooks/use-posts-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { IconArrowLeft } from "@tabler/icons-react";

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  content: z.string().default(""),
  published: z.boolean(),
  productIds: z.string().default(""),
});

type PostFormValues = z.infer<typeof postSchema>;

interface Product {
  id: number;
  name: string;
}

interface PostFormProps {
  post?: Post | null;
  isLoading?: boolean;
}

export function PostForm({ post, isLoading }: PostFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["products"] as const,
    queryFn: () => api.get<Product[]>("/products"),
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm({
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      content: post?.content ?? "",
      published: post?.published ?? false,
      productIds: post?.products?.map((p) => p.id.toString()).join(", ") ?? "",
    } satisfies PostFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = postSchema.safeParse(value);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((e) => {
            const key = e.path[0] as string;
            if (!errors[key]) errors[key] = e.message;
          });
          return errors as any;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        title: value.title,
        slug: value.slug,
        content: value.content || null,
        published: value.published,
        authorId: user?.id ?? "",
        productIds: value.productIds
          ? value.productIds.split(",").map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n))
          : [],
      };

      try {
        if (post) {
          await api.put(`/posts/${post.id}`, payload);
          toast.success("Post atualizado com sucesso");
        } else {
          await api.post("/posts", payload);
          toast.success("Post criado com sucesso");
        }
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        navigate("/dashboard/posts");
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
  });

  useEffect(() => {
    if (post) {
      form.setFieldValue("title", post.title);
      form.setFieldValue("slug", post.slug);
      form.setFieldValue("content", post.content ?? "");
      form.setFieldValue("published", post.published);
      form.setFieldValue("productIds", post.products.map((p) => p.id.toString()).join(", "));
    }
  }, [post]);

  const isEdit = !!post;

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-steel">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/posts")} className="mb-6 -ml-2">
        <IconArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Posts
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Post" : "Novo Post"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="title">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="title">Titulo</Label>
                  <Input
                    id="title"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      if (!slugManuallyEdited) {
                        const slug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "");
                        form.setFieldValue("slug", slug);
                      }
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                </div>
              )}
            </form.Field>

            <form.Field name="slug">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                </div>
              )}
            </form.Field>

            <form.Field name="published">
              {(field) => (
                <div className="flex items-center gap-2">
                  <Switch id="published" checked={field.state.value} onCheckedChange={(v) => field.handleChange(v)} />
                  <Label htmlFor="published">Publicado</Label>
                </div>
              )}
            </form.Field>

            <form.Field name="content">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="content">Conteudo</Label>
                  <Textarea id="content" rows={12} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Field name="productIds">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="productIds">IDs dos Produtos (separados por virgula)</Label>
                  <Input id="productIds" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                  <p className="text-xs text-steel mt-1">
                    Disponiveis: {products?.map((p) => `${p.id} (${p.name})`).join(", ") ?? "..."}
                  </p>
                </div>
              )}
            </form.Field>

            <div className="flex justify-end gap-4 pt-4 border-t border-hairline">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard/posts")}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEdit ? "Salvar" : "Criar Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
