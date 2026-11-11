"use client";

import Link from "next/link";
import { ChatBubble, ChatOptionButton } from "../chat-bubbles";
import { useStoreSettings } from "@/lib/store-settings-context";

export type HelpView = "menu" | "lastOrder" | "orders" | "contact" | "pickup";

export function hasSupportChannel(support: ReturnType<typeof useStoreSettings>["support"]) {
  return Boolean(support.whatsapp || support.phone || support.email);
}

export function HelpMenu({ onSelect }: { onSelect: (view: HelpView) => void }) {
  const { support, pickupAddress } = useStoreSettings();

  return (
    <>
      <ChatBubble role="assistant">Oi! Como posso ajudar?</ChatBubble>
      <div className="flex flex-col gap-2">
        <ChatOptionButton onClick={() => onSelect("lastOrder")}>
          Minha última compra
        </ChatOptionButton>
        <ChatOptionButton onClick={() => onSelect("orders")}>
          Status dos meus pedidos
        </ChatOptionButton>
        {hasSupportChannel(support) && (
          <ChatOptionButton onClick={() => onSelect("contact")}>Falar com a loja</ChatOptionButton>
        )}
        {pickupAddress && (
          <ChatOptionButton onClick={() => onSelect("pickup")}>Retirada na loja</ChatOptionButton>
        )}
      </div>
    </>
  );
}

/** Resposta de "Status dos meus pedidos": texto curto + atalho para a página. */
export function OrdersAnswer() {
  return (
    <>
      <ChatBubble role="assistant">
        O andamento de cada pedido fica na página Meus pedidos.
      </ChatBubble>
      <ChatOptionButton asChild>
        <Link href="/pedidos">Ver meus pedidos</Link>
      </ChatOptionButton>
    </>
  );
}
