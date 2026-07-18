import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Consistent section header with optional description and "Ver todos" link.
 *
 * Used by homepage sections (Mais Vendidos, Novidades, etc.) to avoid
 * duplicating the title + description + link pattern.
 */
export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "Ver todos",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-steel hover:text-ink transition-colors shrink-0"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
