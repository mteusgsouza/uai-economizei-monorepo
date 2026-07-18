import { BookCard } from "../book-card"

const featuredBooks = [
  {
    title: "The Art of Thinking Clearly",
    author: "Rolf Dobelli",
    price: "$24.99",
    rating: 4.7,
    cover: "https://placehold.co/200x300/1e2329/fcd535?text=Book",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    price: "$19.99",
    rating: 4.5,
    cover: "https://placehold.co/200x300/1e2329/fcd535?text=Book",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: "$21.99",
    rating: 4.8,
    cover: "https://placehold.co/200x300/1e2329/fcd535?text=Book",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: "$18.99",
    rating: 4.6,
    cover: "https://placehold.co/200x300/1e2329/fcd535?text=Book",
  },
]

export function FeaturedBooksSection() {
  return (
    <section className="bg-(--binance-canvas-dark) px-4 py-16 md:py-20">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="font-sans text-2xl font-semibold text-(--foreground) md:text-3xl">
          Featured Books
        </h2>
        <p className="mt-2 text-sm text-(--binance-muted)">
          Hand-picked titles our readers love right now
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}
        </div>
      </div>
    </section>
  )
}
