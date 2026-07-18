import { useState } from "react"
import { Link } from "react-router-dom"
import { IconBooks, IconMenu2, IconSearch, IconX } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

const navLinks = [
  { label: "Browse", href: "#" },
  { label: "Categories", href: "#" },
  { label: "Bestsellers", href: "#" },
  { label: "New Releases", href: "#" },
  { label: "About", href: "#" },
]

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-(--binance-canvas-dark) border-(--binance-hairline-on-dark)">
      <div className="mx-auto flex w-full max-w-[1280px] items-center px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-(--primary)">
          <IconBooks className="size-6" />
          <span className="text-base font-semibold tracking-tight text-(--foreground)">
            Book<span className="text-(--primary)">Store</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-8 hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-(--binance-body)/80 transition-colors hover:text-(--foreground)"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3">
          <button className="hidden size-9 items-center justify-center rounded-md text-(--binance-muted) transition-colors hover:text-(--foreground) sm:flex">
            <IconSearch className="size-5" />
          </button>
          <Link to="/login">
            <Button variant="ghost" className="text-(--binance-body) hover:text-(--foreground)">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="rounded-full bg-(--primary) px-6 py-2.5 text-sm font-semibold text-(--primary-foreground) hover:bg-(--binance-primary-active)">
              Sign Up
            </Button>
          </Link>
          {/* Mobile hamburger */}
          <button
            className="ml-1 flex size-9 items-center justify-center rounded-md text-(--binance-body) md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <IconMenu2 className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex bg-(--binance-canvas-dark)/95 md:hidden">
          <div className="flex w-full flex-col p-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-(--primary)" onClick={() => setMenuOpen(false)}>
                <IconBooks className="size-6" />
                <span className="text-base font-semibold text-(--foreground)">
                  Book<span className="text-(--primary)">Store</span>
                </span>
              </Link>
              <button onClick={() => setMenuOpen(false)} className="text-(--binance-body)">
                <IconX className="size-6" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-(--binance-body)"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-(--binance-hairline-on-dark)" />
              <Link
                to="/login"
                className="text-lg font-medium text-(--binance-body)"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex h-12 items-center justify-center rounded-full bg-(--primary) text-base font-semibold text-(--primary-foreground)"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
