import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/http-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { IconArrowLeft } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

const brandSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormData {
  id: number;
  name: string;
}

interface BrandFormProps {
  brand?: BrandFormData | null;
}

export function BrandForm({ brand }: BrandFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!brand;

  const form = useForm({
    defaultValues: {
      name: brand?.name ?? "",
    } satisfies BrandFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = brandSchema.safeParse(value);
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
      try {
        if (isEdit) {
          await api.put(`/brands/${brand.id}`, { name: value.name });
          toast.success("Marca atualizada com sucesso");
        } else {
          await api.post("/brands", { name: value.name });
          toast.success("Marca criada com sucesso");
        }
        queryClient.invalidateQueries({ queryKey: ["brands"] });
        navigate("/dashboard/brands");
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    onSubmitInvalid: ({ value }) => {
      const result = brandSchema.safeParse(value);
      if (!result.success) {
        const first = result.error.errors[0];
        toast.error(`Campo "${String(first.path[0])}": ${first.message}`);
      }
    },
  });

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/brands")} className="mb-6 -ml-2">
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Marcas
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Marca" : "Nova Marca"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
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

            <div className="border-border flex justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard/brands")}>
                Cancelar
              </Button>
              <Button type="submit">{isEdit ? "Salvar" : "Criar Marca"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
