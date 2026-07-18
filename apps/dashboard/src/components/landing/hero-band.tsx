import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"

export function HeroBand() {
  return (
    <section className="flex flex-col items-center justify-center bg-(--binance-canvas-dark) px-4 py-(--spacing-section) text-center">
      <h1 className="max-w-3xl font-sans text-5xl font-bold leading-tight tracking-tight text-(--foreground) md:text-6xl lg:text-7xl">
        Discover Your Next
        <br />
        <span className="text-(--primary)">Great Read</span>
      </h1>
      <p className="mt-6 max-w-xl text-base text-(--binance-muted) md:text-lg">
        Thousands of books curated by readers, for readers. Browse bestsellers, discover new authors, and build your
        personal library.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link to="/register">
          <Button className="h-12 rounded-[6px] bg-(--primary) px-8 text-sm font-semibold text-(--primary-foreground) hover:bg-(--binance-primary-active)">
            Browse Books
          </Button>
        </Link>
        <Button
          variant="secondary"
          className="h-12 rounded-[6px] bg-(--binance-surface-card-dark) px-8 text-sm font-semibold text-(--foreground) hover:bg-(--binance-surface-elevated-dark)"
        >
          Join Free
        </Button>
      </div>
    </section>
  )
}
