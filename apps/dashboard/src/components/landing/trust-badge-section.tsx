const badges = [
  { title: "Best Prices", description: "Competitive pricing on every title, with daily deals" },
  { title: "Fast Delivery", description: "Free shipping on orders over $35, same-week delivery" },
  { title: "Curated Selection", description: "Hand-picked recommendations from expert readers" },
  { title: "Reader Reviews", description: "Honest reviews from a community of passionate readers" },
]

export function TrustBadgeSection() {
  return (
    <section className="bg-[var(--binance-canvas-dark)] px-4 py-16">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center font-sans text-2xl font-semibold text-[var(--foreground)] md:text-3xl">
          Why readers choose us
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="rounded-lg bg-[var(--binance-surface-card-dark)] p-5 transition-colors hover:bg-[var(--binance-surface-elevated-dark)]"
            >
              <h3 className="text-base font-semibold text-[var(--foreground)]">{badge.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--binance-muted)]">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
