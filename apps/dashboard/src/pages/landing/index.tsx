import { ThemeRoot } from "../../components/theme-root"
import { TopNav } from "../../components/landing/top-nav"
import { HeroBand } from "../../components/landing/hero-band"
import { StatCalloutSection } from "../../components/landing/stat-callout-section"
import { TrustBadgeSection } from "../../components/landing/trust-badge-section"
import { FeaturedBooksSection } from "../../components/landing/featured-books-section"
import { CtaBand } from "../../components/landing/cta-band"
import { FooterLight } from "../../components/landing/footer-light"

export default function LandingPage() {
  return (
    <ThemeRoot theme="dark">
      <div className="min-h-screen bg-[var(--binance-canvas-dark)]">
        <TopNav />
        <main>
          <HeroBand />
          <StatCalloutSection />
          <TrustBadgeSection />
          <FeaturedBooksSection />
          <CtaBand />
        </main>
        <FooterLight />
      </div>
    </ThemeRoot>
  )
}
