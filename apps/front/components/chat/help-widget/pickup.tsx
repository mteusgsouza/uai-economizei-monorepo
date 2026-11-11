"use client";

import { addressLines } from "@/lib/address";
import { useStoreSettings } from "@/lib/store-settings-context";
import { ChatBubble } from "../chat-bubbles";

export function Pickup() {
  const { pickupAddress } = useStoreSettings();
  if (!pickupAddress) return null;

  return (
    <>
      <ChatBubble role="assistant">Você pode retirar seu pedido no balcão, em:</ChatBubble>
      <ChatBubble role="assistant">{addressLines(pickupAddress).join("\n")}</ChatBubble>
    </>
  );
}
