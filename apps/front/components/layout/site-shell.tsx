import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@workspace/ui/lib/utils";

interface SiteShellProps {
  children: React.ReactNode;
  /** Classes extras no <main> — normalmente o respiro vertical da rota. */
  mainClassName?: string;
}

/**
 * Chrome do site: header, rodapé e o fundo da página. Existe para as rotas
 * servidas pelo CMS entrarem no mesmo enquadramento das páginas escritas à mão,
 * que hoje repetem esse wrapper uma a uma.
 */
export function SiteShell({ children, mainClassName }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      <SiteFooter />
    </div>
  );
}
