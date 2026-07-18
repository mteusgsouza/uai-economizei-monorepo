import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"

export function CtaBand() {
  return (
    <section className="flex justify-center px-4 py-16 md:py-20">
      <div className="flex w-full max-w-7xl flex-col items-center gap-8 rounded-xl bg-(--binance-surface-card-dark) px-8 py-12 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-foreground md:text-3xl">
            Start Your Reading Journey Today
          </h2>
          <p className="mt-2 text-sm text-(--binance-muted)">
            Create a free account and get personalized book recommendations.
          </p>
        </div>
        <Link to="/register">
          <Button className="h-12 rounded-[6px] bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-(--binance-primary-active)">
            Create Free Account
          </Button>
        </Link>
      </div>
    </section>
  )
}
