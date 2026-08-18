"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import type { CustomerAddress } from "@/types/order";
import { addressLines } from "@/lib/address";
import { Mono } from "@/components/ui/mono";
import { Tag } from "@/components/ui/tag";

interface AddressCardProps {
  address: CustomerAddress;
  /** Eleger um padrão só faz sentido quando há mais de um endereço. */
  showSetDefault: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

function Action({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.14em] hover:underline",
        "disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40",
        tone === "danger" ? "text-brand-error" : "text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function AddressCard({
  address,
  showSetDefault,
  disabled,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  // Exclusão em dois toques, no lugar de um diálogo: o alvo já está na tela e no
  // mobile o modal cobriria justamente o endereço que se quer conferir.
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={cn("blueprint flex flex-col p-4", address.isDefault && "bg-accent-100/60")}>
      <div className="flex items-center gap-2">
        {address.isDefault ? <Tag>Padrão</Tag> : <Tag variant="outline">Entrega</Tag>}
      </div>

      <div className="mt-2.5 flex-1 text-[15px] leading-normal">
        {addressLines(address).map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-divider pt-3">
        {confirming ? (
          <>
            <Mono as="span" className="text-ink/55">
              Excluir este endereço?
            </Mono>
            <Action onClick={onDelete} disabled={disabled} tone="danger">
              Sim, excluir
            </Action>
            <Action onClick={() => setConfirming(false)} disabled={disabled}>
              Cancelar
            </Action>
          </>
        ) : (
          <>
            {showSetDefault && !address.isDefault && (
              <Action onClick={onSetDefault} disabled={disabled}>
                Tornar padrão
              </Action>
            )}
            <Action onClick={onEdit} disabled={disabled}>
              Editar
            </Action>
            <Action onClick={() => setConfirming(true)} disabled={disabled} tone="danger">
              Excluir
            </Action>
          </>
        )}
      </div>
    </div>
  );
}
