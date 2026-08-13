import { SiteShell } from '@/components/layout/site-shell'

// Sem respiro no <main>: cada bloco da página traz o próprio `py-*`.
export default function CmsPageLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
