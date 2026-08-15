"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import type { CustomerAddress } from "@/types/order";
import { useCreateAddress } from "@/hooks/use-account";
import { AddressForm } from "@/components/checkout/address-form";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { Mono } from "@/components/ui/mono";
import { Tag } from "@/components/ui/tag";

interface AddressListProps {
  addresses: CustomerAddress[];
  isLoading: boolean;
}

function AddressCard({ address, isDefault }: { address: CustomerAddress; isDefault: boolean }) {
  const line1 = [address.street, address.number].filter(Boolean).join(", ");

  return (
    <div className={`blueprint p-4 ${isDefault ? "bg-accent-100/60" : ""}`}>
      <div className="flex items-center gap-2">
        {isDefault ? <Tag>Padrão</Tag> : <Tag variant="outline">Entrega</Tag>}
      </div>
      <div className="mt-2.5 text-[15px] leading-normal">
        {line1}
        {address.complement ? ` — ${address.complement}` : ""}
        <br />
        {[address.neighborhood, `${address.city} / ${address.state}`]
          .filter(Boolean)
          .join(" · ")}
        <br />
        {address.postalCode}
      </div>
    </div>
  );
}

/**
 * Endereços do cliente. A Nest só expõe listar e criar — não há rota de editar
 * nem de excluir, então o cartão é de leitura e o "Novo endereço" abre o mesmo
 * formulário do checkout.
 */
export function AddressList({ addresses, isLoading }: AddressListProps) {
  const [adding, setAdding] = useState(false);
  const create = useCreateAddress();

  return (
    <section id="enderecos" className="blueprint mt-6 scroll-mt-24 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <h2 className="font-heading text-[22px] uppercase leading-none">Endereços</h2>
        <span className="h-px flex-1 bg-divider" />
        <button
          type="button"
          onClick={() => setAdding((open) => !open)}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:underline"
        >
          {adding ? "Fechar" : "+ Novo endereço"}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BlueprintSkeleton className="h-32" />
          <BlueprintSkeleton className="h-32" />
        </div>
      ) : addresses.length === 0 ? (
        <Mono as="p" className="block text-ink/50">
          Nenhum endereço salvo — o primeiro entra no próximo checkout
        </Mono>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address, index) => (
            <AddressCard key={address.id} address={address} isDefault={index === 0} />
          ))}
        </div>
      )}

      {adding && (
        <div className="blueprint mt-5 p-4">
          <AddressForm
            onSubmit={async (values) => {
              try {
                await create.mutateAsync(values);
                toast.success("Endereço salvo");
                setAdding(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erro ao salvar");
              }
            }}
          >
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Salvando…" : "Salvar endereço"}
            </Button>
          </AddressForm>
        </div>
      )}
    </section>
  );
}
