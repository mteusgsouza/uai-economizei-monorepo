"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Mono } from "@/components/ui/mono";
import { COOKIE_NOTICE } from "@/lib/storefront-content";

const STORAGE_KEY = "store-cookie-consent";

export type CookieChoice = "all" | "essential";

interface StoredConsent {
  choice: CookieChoice;
  /** ISO. A LGPD pede saber *quando* a pessoa consentiu, não só o quê. */
  date: string;
}

function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.choice === "all" || parsed.choice === "essential" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * O que o cliente aceitou. Quem for plugar analytics depois consulta isto antes
 * de carregar qualquer script — hoje não há nenhum, e é justamente por isso que
 * o gancho já nasce pronto: script que entra sem passar por aqui é o jeito
 * clássico de o banner virar enfeite.
 */
export function hasConsent(kind: CookieChoice = "all"): boolean {
  const stored = readConsent();
  if (!stored) return false;
  return kind === "essential" || stored.choice === "all";
}

/**
 * Aviso de cookies. Só aparece depois de montar: no servidor não há
 * `localStorage`, e renderizar o banner no HTML para escondê-lo na hidratação
 * faria ele piscar em toda visita de quem já respondeu.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  function choose(choice: CookieChoice) {
    try {
      const consent: StoredConsent = { choice, date: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // Storage cheio ou bloqueado: fechar o aviso é melhor do que travar a
      // navegação num banner que não sai.
    }
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label={COOKIE_NOTICE.title}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-divider bg-surface p-4 md:p-5"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[640px]">
          <Mono as="div" className="mb-1 text-ink/50">
            {COOKIE_NOTICE.title}
          </Mono>
          <p className="text-[13px] leading-snug text-ink/70">
            {COOKIE_NOTICE.body}{" "}
            <Link href={COOKIE_NOTICE.policyHref} className="nav-link underline">
              {COOKIE_NOTICE.policyLabel}
            </Link>
          </p>
        </div>

        <div className="flex flex-none gap-2">
          {/* O menos invasivo vem primeiro e é o visualmente neutro: recusar
              não pode ser mais difícil do que aceitar. */}
          <Button variant="outline" onClick={() => choose("essential")}>
            {COOKIE_NOTICE.essentialLabel}
          </Button>
          <Button onClick={() => choose("all")}>{COOKIE_NOTICE.acceptLabel}</Button>
        </div>
      </div>
    </div>
  );
}
