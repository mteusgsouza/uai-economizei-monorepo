"use client";

import Link from "next/link";
import { Heart, LogOut, Package, User } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useAuth } from "@/lib/use-auth";
import { Mono } from "@/components/ui/mono";

const CELL =
  "ccell flex items-center gap-2.5 border-t border-divider px-3.5 py-2.5 text-sm text-ink";

/**
 * O botão de conta da barra. Deslogado, é só um atalho para o login; logado,
 * abre o menu da conta no mesmo mecanismo do megamenu (hover/foco, sem script).
 */
export function AccountMenu() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="icon" asChild aria-label="Entrar na conta">
        <Link href="/login">
          <User className="size-[17px]" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="hasmenu relative flex items-center self-stretch">
      <Button variant="outline" size="icon" asChild aria-label="Minha conta">
        <Link href="/conta">
          <User className="size-[17px]" />
        </Link>
      </Button>

      <div className="megamenu blueprint absolute right-0 top-[calc(100%+12px)] z-20 w-56 bg-canvas shadow-(--shadow-md)">
        <Mono as="div" className="px-3.5 py-2.5 text-ink/50">
          Minha conta
        </Mono>
        <Link href="/conta" className={CELL}>
          <User className="size-4" />
          Meus dados
        </Link>
        <Link href="/pedidos" className={CELL}>
          <Package className="size-4" />
          Meus pedidos
        </Link>
        <Link href="/wishlist" className={CELL}>
          <Heart className="size-4" />
          Favoritos
        </Link>
        <button type="button" onClick={logout} className={`${CELL} w-full text-left text-ink/55`}>
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
