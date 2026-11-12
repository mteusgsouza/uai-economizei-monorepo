"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";

export const MAX_USER_TURNS = 5;
export const MAX_MESSAGE_LENGTH = 300;
/** A rota aceita até 6 itens começando pelo cliente: manda só a cauda da conversa. */
const HISTORY_SENT = 5;
const DISABLED_KEY = "ue-search-assistant-off";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "loading" | "error";

function readDisabled(): boolean {
  try {
    return sessionStorage.getItem(DISABLED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDisabled() {
  try {
    sessionStorage.setItem(DISABLED_KEY, "1");
  } catch {
    // Sem storage o bloqueio vale só para esta tela — a cota do servidor segura o resto.
  }
}

/** Estado e chamadas do assistente de busca. Estourou cota ou turnos → desativa na sessão. */
export function useSearchAssistant(term: string) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => setDisabled(readDisabled()), []);

  const userTurns = turns.filter((turn) => turn.role === "user").length;

  function disable() {
    persistDisabled();
    setDisabled(true);
  }

  async function request(history: Turn[]) {
    setStatus("loading");
    try {
      const res = await fetch("/assistente-busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, messages: history.slice(-HISTORY_SENT) }),
      });
      if (res.status === 429 || res.status === 503) {
        setStatus("idle");
        disable();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as { message: string; products: Product[] };
      const next: Turn[] = [...history, { role: "assistant", content: data.message }];
      setTurns(next);
      if (data.products.length) setProducts(data.products);
      setStatus("idle");
      if (next.filter((turn) => turn.role === "user").length >= MAX_USER_TURNS) disable();
    } catch {
      setStatus("error");
    }
  }

  function send(text: string) {
    const content = text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content || disabled || status === "loading") return;
    const history: Turn[] = [...turns, { role: "user", content }];
    setTurns(history);
    void request(history);
  }

  /** Reenvia a conversa como está (a última fala do cliente ficou sem resposta). */
  function retry() {
    if (turns.at(-1)?.role === "user") void request(turns);
  }

  return { turns, products, status, disabled, userTurns, send, retry };
}
