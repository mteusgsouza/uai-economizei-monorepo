import { Mono } from "@/components/ui/mono";

interface Stat {
  value: string;
  label: string;
}

/**
 * Três números na régua horizontal, separados por fio vertical — a "ficha
 * técnica" da loja logo abaixo da vitrine.
 */
export function StatsStrip({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10">
      <div
        className="mt-6 grid border-y border-divider md:mt-8"
        style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))` }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={
              i === 0
                ? "py-3 md:py-4"
                : "border-l border-divider py-3 pl-3.5 md:py-4 md:pl-5"
            }
          >
            <div className="font-heading text-2xl leading-none md:text-[30px]">{stat.value}</div>
            <Mono as="div" className="text-ink/55">
              {stat.label}
            </Mono>
          </div>
        ))}
      </div>
    </div>
  );
}
