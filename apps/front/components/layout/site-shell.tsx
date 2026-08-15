import { cn } from "@workspace/ui/lib/utils";
import { getCategories, getCategoryCounts } from "@/lib/catalog/taxonomy";
import { getStoreSettings } from "@/lib/catalog/settings";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BenefitsBand } from "@/components/layout/benefits-band";

interface SiteShellProps {
  children: React.ReactNode;
  /** Classes extras no `<main>` — normalmente o respiro vertical da rota. */
  mainClassName?: string;
  /** A faixa de aço fecha as vitrines; em checkout e conta ela sobra. */
  showBenefits?: boolean;
}

/**
 * O chrome do site: barra, gavetas, rodapé e o fundo da página. Toda rota
 * pública passa por aqui — é o único lugar que busca categorias e as regras
 * comerciais, que o cabeçalho e as gavetas precisam.
 */
export async function SiteShell({
  children,
  mainClassName,
  showBenefits = true,
}: SiteShellProps) {
  const [categories, counts, settings] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    getStoreSettings(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader categories={categories} counts={counts} settings={settings} />
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      {showBenefits && <BenefitsBand settings={settings} />}
      <SiteFooter />
    </div>
  );
}
