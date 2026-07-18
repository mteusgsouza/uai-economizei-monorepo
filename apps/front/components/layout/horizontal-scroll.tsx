"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollProps {
  title?: string;
  href?: string;
  children: React.ReactNode;
}

export function HorizontalScroll({ title, href, children }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(amount: number) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  return (
    <div>
      {(title || href) && (
        <div className="flex items-end justify-between mb-6">
          {title && (
            <h2 className="font-heading text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              {title}
            </h2>
          )}
          {href && (
            <Link
              href={href}
              className="text-sm font-medium text-steel hover:text-ink transition-colors shrink-0"
            >
              Ver todos
            </Link>
          )}
        </div>
      )}
      <div className="relative group/scroll">
        <button
          type="button"
          onClick={() => scroll(-300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-canvas/90 backdrop-blur-sm border border-hairline flex items-center justify-center text-steel hover:text-ink shadow-sm opacity-0 group-hover/scroll:opacity-100 transition-opacity -ml-4 disabled:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" as any }}
        >
          {children}
        </div>
        <button
          type="button"
          onClick={() => scroll(300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-canvas/90 backdrop-blur-sm border border-hairline flex items-center justify-center text-steel hover:text-ink shadow-sm opacity-0 group-hover/scroll:opacity-100 transition-opacity -mr-4 disabled:hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
