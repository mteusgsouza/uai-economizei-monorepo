"use client";

import { Barcode, FileText } from "lucide-react";

export function BoletoInfo() {
  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface">
        <Barcode className="h-24 w-24 text-ink" />
      </div>

      <div className="text-center">
        <p className="text-sm text-ink font-medium">
          Boleto Bancario
        </p>
        <p className="text-xs text-steel mt-1">
          O boleto sera gerado apos a confirmacao do pedido.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-hairline bg-surface p-4">
        <FileText className="h-5 w-5 shrink-0 text-steel mt-0.5" />
        <div className="text-xs text-steel space-y-1">
          <p>Vencimento em 3 dias uteis apos a emissao.</p>
          <p>O pedido e processado apos a confirmacao do pagamento.</p>
          <p>Voce recebera o boleto por email e na pagina de pedidos.</p>
        </div>
      </div>
    </div>
  );
}
