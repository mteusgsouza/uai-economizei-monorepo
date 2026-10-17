import type { SpecGroup } from "@/lib/specs/types";
import { Mono } from "@/components/ui/mono";

/**
 * Tabela da ficha técnica. O título de grupo só aparece quando o modelo usa
 * grupos — uma ficha curta sem grupos é uma tabela só.
 */
export function SpecSheet({ groups }: { groups: SpecGroup[] }) {
  const titled = groups.some((group) => group.title);

  return (
    <section>
      <h2 className="font-heading text-[22px] uppercase md:text-[26px]">Ficha técnica</h2>
      {groups.map((group) => (
        <div key={group.title ?? ""} className="mt-3">
          {titled && (
            <Mono as="h3" className="block pb-1 text-ink">
              {group.title ?? "Geral"}
            </Mono>
          )}
          <table className="w-full text-sm">
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.key} className="border-b border-divider/60">
                  <td className="w-1/2 py-1.5 pr-4 align-top">
                    <Mono className="text-ink/55">{row.label}</Mono>
                  </td>
                  <td className="py-1.5">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
