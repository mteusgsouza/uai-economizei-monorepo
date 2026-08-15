import Link from "next/link";
import { Mono } from "@/components/ui/mono";

interface Crumb {
  label: string;
  href?: string;
}

interface AccountShellProps {
  crumbs: Crumb[];
  children: React.ReactNode;
}

/**
 * O enquadramento das telas de conta: o mesmo bloco central das vitrines, com
 * o breadcrumb em mono no topo. Sem faixa de benefícios — aqui não se vende.
 */
export function AccountShell({ crumbs, children }: AccountShellProps) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6 md:px-10 md:pb-14">
      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        {crumbs.map((crumb, index) => (
          <span key={crumb.label}>
            {" / "}
            {crumb.href && index < crumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:text-accent-700">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ink">{crumb.label}</span>
            )}
          </span>
        ))}
      </Mono>

      {children}
    </div>
  );
}
