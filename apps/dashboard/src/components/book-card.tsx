interface BookCardProps {
  title: string
  author: string
  price: string
  rating: number
  cover: string
}

export function BookCard({ title, author, price, rating, cover }: BookCardProps) {
  return (
    <div className="group cursor-pointer rounded-xl bg-(--binance-surface-card-dark) p-4 transition-colors hover:bg-(--binance-surface-elevated-dark)">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-(--binance-surface-elevated-dark)">
        <img
          src={cover}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-(--foreground) leading-snug">{title}</h3>
      <p className="mt-1 text-xs text-(--binance-muted)">{author}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-sm font-medium tabular-nums text-(--primary)">{price}</span>
        <span className="text-xs text-(--binance-muted-strong)">{rating} ★</span>
      </div>
    </div>
  )
}
