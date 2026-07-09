const columns = [
  {
    title: "Shop",
    links: ["Bestsellers", "New Releases", "Deals", "Gift Cards", "Audiobooks"],
  },
  {
    title: "Account",
    links: ["My Profile", "Orders", "Wishlist", "My Library", "Settings"],
  },
  {
    title: "About",
    links: ["Our Story", "Careers", "Press", "Blog", "Partnerships"],
  },
  {
    title: "Help",
    links: ["FAQs", "Shipping", "Returns", "Contact Us", "Accessibility"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA", "Sitemap"],
  },
  {
    title: "Connect",
    links: ["Twitter", "Instagram", "Facebook", "Goodreads", "Newsletter"],
  },
]

export function FooterLight() {
  return (
    <footer className="bg-[var(--binance-footer-bg)] px-4 py-16 text-[var(--binance-ink)]">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--binance-muted)] transition-colors hover:text-[var(--binance-ink)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-[var(--binance-hairline-on-light)] pt-6 text-center text-sm text-[var(--binance-muted)]">
          &copy; {new Date().getFullYear()} BookStore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
