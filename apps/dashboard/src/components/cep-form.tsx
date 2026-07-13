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

const cepSchema = z.object({
  cepInicial: z.string().min(1, "CEP inicial e obrigatorio"),
  cepFinal: z.string().min(1, "CEP final e obrigatorio"),
  descricao: z.string().min(1, "Descricao e obrigatoria"),
  valor: z.string().min(1, "Valor e obrigatorio"),
});

type CepFormValues = z.infer<typeof cepSchema>;

interface CepFormData {
  id: number;
  cepInicial: number;
  cepFinal: number;
  descricao: string;
  valor: number;
}

interface CepFormProps {
  cep?: CepFormData | null;
}

export function CepForm({ cep }: CepFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!cep;

  const form = useForm({
    defaultValues: {
      cepInicial: cep?.cepInicial?.toString() ?? "",
      cepFinal: cep?.cepFinal?.toString() ?? "",
      descricao: cep?.descricao ?? "",
      valor: cep?.valor ? (cep.valor / 100).toFixed(2) : "",
    } satisfies CepFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = cepSchema.safeParse(value);
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
        cepInicial: parseInt(value.cepInicial, 10),
        cepFinal: parseInt(value.cepFinal, 10),
        descricao: value.descricao,
        valor: Math.round(parseFloat(value.valor) * 100),
      };

      try {
        if (isEdit) {
          await api.put(`/cep/${cep.id}`, payload);
          toast.success("Faixa de CEP atualizada com sucesso");
        } else {
          await api.post("/cep", payload);
          toast.success("Faixa de CEP criada com sucesso");
        }
        queryClient.invalidateQueries({ queryKey: ["cep"] });
        navigate("/dashboard/cep");
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    onSubmitInvalid: ({ value }) => {
      const result = cepSchema.safeParse(value);
      if (!result.success) {
        const first = result.error.errors[0];
        toast.error(`Campo "${String(first.path[0])}": ${first.message}`);
      }
    },
  });

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/cep")} className="mb-6 -ml-2">
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Voltar para CEP
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Faixa de CEP" : "Nova Faixa de CEP"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="cepInicial">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="cepInicial">CEP Inicial</Label>
                    <Input
                      id="cepInicial"
                      type="number"
                      placeholder="00000000"
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

              <form.Field name="cepFinal">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="cepFinal">CEP Final</Label>
                    <Input
                      id="cepFinal"
                      type="number"
                      placeholder="99999999"
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
            </div>

            <form.Field name="descricao">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="descricao">Descricao</Label>
                  <Input
                    id="descricao"
                    placeholder="ex: Regiao Sudeste"
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

            <form.Field name="valor">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor="valor">Valor do Frete (R$)</Label>
                  <Input
                    id="valor"
                    placeholder="0,00"
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
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard/cep")}>
                Cancelar
              </Button>
              <Button type="submit">{isEdit ? "Salvar" : "Criar Faixa"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
