"use client";

import { useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import type { CustomerAddress } from "@/types/order";
import {
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/hooks/use-addresses";
import { AddressForm, type AddressFormValues } from "@/components/checkout/address-form";
import { toAddressFormValues } from "@/lib/address";
import { AddressCard } from "@/components/account/address-card";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { Mono } from "@/components/ui/mono";

interface AddressListProps {
  addresses: CustomerAddress[];
  isLoading: boolean;
}

/**
 * Endereços do cliente. O formulário fica antes da lista — no mobile os cartões
 * o empurrariam para fora da tela e "Novo endereço" pareceria não fazer nada —
 * e o mesmo slot serve para criar e para editar, conforme `editing`.
 */
export function AddressList({ addresses, isLoading }: AddressListProps) {
  // `null` = ninguém mexeu no botão ainda, então quem decide é a lista: sem
  // nenhum endereço, o formulário já nasce aberto para o cliente preencher.
  const [adding, setAdding] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const create = useCreateAddress();
  const update = useUpdateAddress();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const isEmpty = !isLoading && addresses.length === 0;
  const showForm = editing !== null || (adding ?? isEmpty);
  const busy =
    create.isPending || update.isPending || remove.isPending || setDefault.isPending;

  const closeForm = () => {
    setEditing(null);
    setAdding(false);
  };

  const startEditing = (address: CustomerAddress) => {
    setEditing(address);
    setAdding(true);
    // Sem isso, editar um cartão do fim da lista no mobile não mostraria nada.
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (values: AddressFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values });
        toast.success("Endereço atualizado");
      } else {
        await create.mutateAsync(values);
        toast.success("Endereço salvo");
      }
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    }
  };

  const runAction = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir");
    }
  };

  const handleDelete = async (address: CustomerAddress) => {
    await runAction(remove.mutateAsync(address.id), "Endereço excluído");
    if (editing?.id === address.id) closeForm();
  };

  return (
    <section id="enderecos" ref={sectionRef} className="blueprint mt-6 scroll-mt-24 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <h2 className="font-heading text-[22px] uppercase leading-none">Endereços</h2>
        <span className="h-px flex-1 bg-divider" />
        <button
          type="button"
          onClick={() => (showForm ? closeForm() : setAdding(true))}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:underline"
        >
          {showForm ? "Fechar" : "+ Novo endereço"}
        </button>
      </div>

      {showForm && (
        <div className="blueprint mb-5 p-4">
          <Mono as="p" className="mb-3.5 block text-ink/55">
            {editing ? "Editando endereço" : "Novo endereço"}
          </Mono>
          <AddressForm
            // O formulário é uncontrolled: sem remontar, trocar de endereço em
            // edição não trocaria os valores dos campos.
            key={editing?.id ?? "new"}
            defaultValues={editing ? toAddressFormValues(editing) : undefined}
            onSubmit={handleSubmit}
          >
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Salvando…" : "Salvar endereço"}
            </Button>
          </AddressForm>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BlueprintSkeleton className="h-32" />
          <BlueprintSkeleton className="h-32" />
        </div>
      ) : isEmpty ? (
        <Mono as="p" className="block text-ink/50">
          {showForm
            ? "Nenhum endereço salvo — preencha o formulário acima para cadastrar o primeiro"
            : "Nenhum endereço salvo — o primeiro entra no próximo checkout"}
        </Mono>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              showSetDefault={addresses.length > 1}
              disabled={busy}
              onEdit={() => startEditing(address)}
              onDelete={() => void handleDelete(address)}
              onSetDefault={() =>
                runAction(setDefault.mutateAsync(address.id), "Endereço padrão atualizado")
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
