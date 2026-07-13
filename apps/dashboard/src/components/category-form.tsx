import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/http-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { IconArrowLeft, IconPlus, IconX } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

const categorySchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  categorySlug: z.string().min(1, "Slug e obrigatorio"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface SubcategoryItem {
  id?: number;
  title: string;
  subcatSlug: string;
}

interface CategoryFormData {
  id: number;
  title: string;
  categorySlug: string;
  subcategories: SubcategoryItem[];
}

interface CategoryFormProps {
  category?: CategoryFormData | null;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>(
    category?.subcategories?.map((s) => ({ ...s })) ?? []
  );

  function addSubcategory() {
    setSubcategories((prev) => [...prev, { title: "", subcatSlug: "" }]);
  }

  function updateSubcategory(index: number, field: keyof SubcategoryItem, value: string) {
    setSubcategories((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function removeSubcategory(index: number) {
    setSubcategories((prev) => prev.filter((_, i) => i !== index));
  }

  const form = useForm({
    defaultValues: {
      title: category?.title ?? "",
      categorySlug: category?.categorySlug ?? "",
    } satisfies CategoryFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = categorySchema.safeParse(value);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((e) => {
            const key = e.path[0] as string;
            if (!errors[key]) errors[key] = e.message;
          });
          return errors;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        title: value.title,
        categorySlug: value.categorySlug,
        subcategories: subcategories
          .filter((s) => s.title.length > 0)
          .map((s) => ({
            title: s.title,
            subcatSlug: s.subcatSlug,
          })),
      };

      try {
        if (isEdit) {
          await api.put(`/categories/${category.id}`, payload);
          toast.success("Categoria atualizada com sucesso");
        } else {
          await api.post("/categories", payload);
          toast.success("Categoria criada com sucesso");
        }
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        navigate("/dashboard/categories");
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    onSubmitInvalid: ({ value }) => {
      const result = categorySchema.safeParse(value);
      if (!result.success) {
        const first = result.error.errors[0];
        toast.error(`Campo "${String(first.path[0])}": ${first.message}`);
      }
    },
  });

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/categories")} className="mb-6 -ml-2">
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Categorias
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{isEdit ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
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
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="categorySlug">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="categorySlug">Slug</Label>
                    <Input
                      id="categorySlug"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="ex: eletronicos"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="border-border flex justify-end gap-4 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard/categories")}>
                  Cancelar
                </Button>
                <Button type="submit">{isEdit ? "Salvar" : "Criar Categoria"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Subcategorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-steel">Gerencie as subcategorias</p>
              <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>
                <IconPlus className="mr-1 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <Separator />
            {subcategories.length === 0 && (
              <p className="text-steel text-sm">Nenhuma subcategoria adicionada.</p>
            )}
            {subcategories.map((sub, index) => (
              <div key={index} className="space-y-2 rounded border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Subcategoria {index + 1}</Label>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSubcategory(index)}>
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Titulo"
                  value={sub.title}
                  onChange={(e) => updateSubcategory(index, "title", e.target.value)}
                />
                <Input
                  placeholder="Slug"
                  value={sub.subcatSlug}
                  onChange={(e) => updateSubcategory(index, "subcatSlug", e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
