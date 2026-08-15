import { formatPrice } from "@workspace/ui/lib/format-price";
import type { Order } from "@/types/order";
import { Mono } from "@/components/ui/mono";
import { orderTotal } from "./order-status";

/**
 * Três números tirados dos pedidos do cliente. "Economia acumulada" e
 * "cupons ativos" do mockup ficaram de fora: não existe modelo para eles.
 */
export function AccountStats({ orders }: { orders: Order[] }) {
  const inTransit = orders.filter((order) => order.status === "SHIPPED");
  const delivered = orders.filter((order) => order.status === "DELIVERED");

  const currentYear = new Date().getFullYear();
  const ofYear = orders.filter(
    (order) => new Date(order.createdAt).getFullYear() === currentYear,
  );
  const yearTotal = ofYear.reduce((sum, order) => sum + orderTotal(order), 0);

  const cells = [
    {
      label: "Em trânsito",
      value: inTransit.length,
      note: inTransit.length > 0 ? "a caminho do endereço" : "nada em rota",
      accent: inTransit.length > 0,
    },
    {
      label: `Pedidos em ${currentYear}`,
      value: ofYear.length,
      note: formatPrice(yearTotal),
      accent: false,
    },
    {
      label: "Entregues",
      value: delivered.length,
      note: `de ${orders.length} no total`,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
      {cells.map((cell) => (
        <div key={cell.label} className="blueprint p-4">
          <Mono as="div" className="text-ink/50">
            {cell.label}
          </Mono>
          <div className="font-heading text-[34px] leading-tight">
            {String(cell.value).padStart(2, "0")}
          </div>
          <Mono as="div" className={cell.accent ? "text-accent-700" : "text-ink/50"}>
            {cell.note}
          </Mono>
        </div>
      ))}
    </div>
  );
}
