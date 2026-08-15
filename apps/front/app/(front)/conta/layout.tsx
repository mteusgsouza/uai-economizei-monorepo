import { SiteShell } from "@/components/layout/site-shell";

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell showBenefits={false}>{children}</SiteShell>;
}
