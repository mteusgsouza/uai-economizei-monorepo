import { SiteShell } from '@/components/layout/site-shell'

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell mainClassName="py-16 md:py-20 lg:py-24">{children}</SiteShell>
}
