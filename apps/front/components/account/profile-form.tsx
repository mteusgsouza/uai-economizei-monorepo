"use client";

import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/sonner";
import type { CustomerProfile } from "@/types/order";
import { useUpdateProfile } from "@/hooks/use-account";
import { Mono } from "@/components/ui/mono";

const profileSchema = z.object({
  firstName: z.string().min(2, "Informe seu nome"),
  lastName: z.string(),
  phone: z.string(),
});

const FIELDS = [
  { name: "firstName", label: "Nome", placeholder: "Seu nome" },
  { name: "lastName", label: "Sobrenome", placeholder: "Seu sobrenome" },
  { name: "phone", label: "Celular", placeholder: "(00) 00000-0000" },
] as const;

/** Ficha 01: o que o cliente pode mudar em `/customers/me`. */
export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const update = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phone: profile.phone ?? "",
    },
    validators: { onChange: profileSchema },
    onSubmit: async ({ value }) => {
      try {
        await update.mutateAsync(value);
        toast.success("Dados atualizados");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    },
  });

  return (
    <section className="blueprint mt-6 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <h2 className="font-heading text-[22px] uppercase leading-none">
          Dados pessoais
        </h2>
        <span className="h-px flex-1 bg-divider" />
        <Mono className="text-ink/45">ficha 01</Mono>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((item) => (
            <form.Field key={item.name} name={item.name}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name} className="text-xs text-ink/70">
                    {item.label}
                  </Label>
                  <Input
                    id={field.name}
                    placeholder={item.placeholder}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {String(field.state.meta.errors[0]?.message ?? "")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          ))}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-email" className="text-xs text-ink/70">
              E-mail
            </Label>
            <Input
              id="account-email"
              value={profile.email}
              readOnly
              aria-readonly
              className="bg-surface text-ink/60"
            />
            <Mono className="text-ink/45">o e-mail vem do login e não muda aqui</Mono>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset()}
            disabled={update.isPending}
          >
            Cancelar
          </Button>
          <span className="flex-1" />
          <Link
            href="/forgot-password"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:underline"
          >
            Alterar senha
          </Link>
        </div>
      </form>
    </section>
  );
}
