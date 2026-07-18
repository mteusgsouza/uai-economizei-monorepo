const stats = [
  { value: "50,000+", label: "Books Available" },
  { value: "2M+", label: "Active Readers" },
  { value: "4.8 / 5", label: "Reader Rating" },
  { value: "150+", label: "Publishers" },
]

export function StatCalloutSection() {
  return (
    <section className="bg-(--binance-canvas-dark) px-4 py-16 md:py-20">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-12 md:gap-20">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-mono text-4xl font-bold tabular-nums text-(--primary) md:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-(--binance-muted)">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
