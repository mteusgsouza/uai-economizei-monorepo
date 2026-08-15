import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Mono } from "@/components/ui/mono";
import { Tag } from "@/components/ui/tag";
import { Logo } from "./logo";
import { FOOTER_LINKS } from "./nav-links";

const COLUMNS = [
  { title: "Navegar", links: FOOTER_LINKS.navegar },
  { title: "Ajuda", links: FOOTER_LINKS.ajuda },
  { title: "Sobre", links: FOOTER_LINKS.sobre },
] as const;

function Newsletter() {
  return (
    <div>
      <Logo href={null} size="md" />
      <p className="mt-2 max-w-[260px] text-[13px] text-ink/60">
        Sua loja online de confiança. Preço à vista sempre visível.
      </p>
      <form className="mt-4 flex gap-2">
        <Input
          type="email"
          placeholder="Seu e-mail"
          aria-label="Seu e-mail"
          className="max-w-[200px]"
        />
        <Button variant="outline" type="submit" className="flex-none">
          Assinar
        </Button>
      </form>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-divider">
      {/* desktop: quatro colunas na malha */}
      <div className="mx-auto hidden max-w-[1280px] grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 px-10 py-12 md:grid">
        <Newsletter />
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <Mono as="div" className="mb-2.5 text-ink/50">
              {column.title}
            </Mono>
            <div className="flex flex-col gap-1.5 text-sm">
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link text-ink">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* mobile: os mesmos grupos em accordion */}
      <div className="md:hidden">
        <div className="px-4 pt-5 pb-4">
          <Newsletter />
        </div>
        {COLUMNS.map((column) => (
          <details key={column.title} className="acc border-t border-divider">
            <summary className="flex items-center gap-2 px-4 py-3.5 font-heading text-[17px] uppercase">
              {column.title}
              <span className="flex-1" />
              <ChevronDown className="chev size-4" />
            </summary>
            <div className="flex flex-col gap-2 px-4 pb-3.5 text-sm">
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link text-ink">
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="border-t border-divider">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-3.5 md:flex-row md:items-center md:px-10">
          <div className="flex flex-wrap gap-1.5">
            <Tag variant="outline">PIX</Tag>
            <Tag variant="outline">Boleto</Tag>
            <Tag variant="outline">Crédito</Tag>
          </div>
          <Mono className="text-ink/50 md:ml-auto">
            © {new Date().getFullYear()} Economizei · CNPJ 00.000.000/0001-00
          </Mono>
        </div>
      </div>
    </footer>
  );
}
