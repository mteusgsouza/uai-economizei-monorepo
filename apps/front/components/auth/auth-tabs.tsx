"use client";

import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

/**
 * As abas Entrar / Criar conta. São links, não estado: cada uma é uma rota
 * própria, e trocar de aba tem que preservar o destino do redirect.
 */
export function AuthTabs({
  current,
  loginHref,
  registerHref,
  className,
}: {
  current: "login" | "register";
  loginHref: string;
  registerHref: string;
  className?: string;
}) {
  const tabs = [
    { key: "login" as const, label: "Entrar", href: loginHref },
    { key: "register" as const, label: "Criar conta", href: registerHref },
  ];

  return (
    <div className={cn("flex w-full border border-divider", className)}>
      {tabs.map((tab, i) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={current === tab.key ? "page" : undefined}
          className={cn(
            "inline-flex min-h-[38px] flex-1 items-center justify-center text-[13px] leading-none transition-colors",
            i > 0 && "border-l border-divider",
            current === tab.key
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent-100",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
