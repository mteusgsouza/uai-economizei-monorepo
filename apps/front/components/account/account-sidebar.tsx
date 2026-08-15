"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAuth } from "@/lib/use-auth";
import { Mono } from "@/components/ui/mono";

interface AccountSidebarProps {
  name: string;
  /** Ano de cadastro — a única "antiguidade" que o modelo conhece. */
  memberSince: string | null;
  orderCount: number;
  wishlistCount: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "UE";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const CELL =
  "ccell flex items-center gap-2.5 border-t border-divider px-4 py-3 text-[15px] text-ink";

/** Cartão de perfil e o menu de células da conta. */
export function AccountSidebar({
  name,
  memberSince,
  orderCount,
  wishlistCount,
}: AccountSidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div>
      <div className="blueprint p-4.5">
        <div className="flex items-center gap-3">
          <span className="blueprint grid size-11 flex-none place-items-center font-heading text-[17px]">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <div className="font-heading text-xl uppercase leading-none">{name}</div>
            {memberSince && (
              <Mono as="div" className="text-ink/50">
                cliente desde {memberSince}
              </Mono>
            )}
          </div>
        </div>
      </div>

      <nav className="mt-4.5 flex flex-col border border-t-0 border-divider">
        <Link
          href="/conta"
          className={cn(CELL, pathname === "/conta" && "bg-accent-100 text-accent-800")}
        >
          <User className="size-4" />
          Meus dados
        </Link>
        <Link
          href="/pedidos"
          className={cn(CELL, pathname === "/pedidos" && "bg-accent-100 text-accent-800")}
        >
          <Package className="size-4" />
          Pedidos
          <span className="flex-1" />
          <Mono className="text-ink/45">{orderCount}</Mono>
        </Link>
        <Link href="/wishlist" className={CELL}>
          <Heart className="size-4" />
          Favoritos
          <span className="flex-1" />
          <Mono className="text-ink/45">{wishlistCount}</Mono>
        </Link>
        <Link href="/conta#enderecos" className={CELL}>
          <MapPin className="size-4" />
          Endereços
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(CELL, "border-b text-left text-ink/55")}
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </nav>
    </div>
  );
}
