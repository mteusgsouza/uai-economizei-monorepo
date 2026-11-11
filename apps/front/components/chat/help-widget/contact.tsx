"use client";

import { useStoreSettings } from "@/lib/store-settings-context";
import { ChatBubble, ChatOptionButton } from "../chat-bubbles";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function Contact() {
  const { support } = useStoreSettings();

  return (
    <>
      <ChatBubble role="assistant">Fale com a gente por um destes canais:</ChatBubble>
      <div className="flex flex-col gap-2">
        {support.whatsapp && (
          <ChatOptionButton asChild>
            <a
              href={`https://wa.me/${onlyDigits(support.whatsapp)}`}
              target="_blank"
              rel="noopener"
            >
              WhatsApp: {support.whatsapp}
            </a>
          </ChatOptionButton>
        )}
        {support.phone && (
          <ChatOptionButton asChild>
            <a href={`tel:+${onlyDigits(support.phone)}`}>Telefone: {support.phone}</a>
          </ChatOptionButton>
        )}
        {support.email && (
          <ChatOptionButton asChild>
            <a href={`mailto:${support.email}`}>E-mail: {support.email}</a>
          </ChatOptionButton>
        )}
      </div>
      {support.hours && <ChatBubble role="assistant">{`Horário: ${support.hours}`}</ChatBubble>}
    </>
  );
}
