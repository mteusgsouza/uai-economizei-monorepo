"use client";

import { QrCode, Copy, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

export function PixInfo() {
  const [copied, setCopied] = useState(false);

  const pixKey = "livraria@pix.com.br";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface">
        <QrCode className="h-24 w-24 text-ink" />
      </div>
      <p className="text-sm text-steel text-center">
        Escaneie o QR Code com seu aplicativo de pagamento
      </p>

      <div className="w-full max-w-xs rounded-lg border border-hairline bg-surface p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-stone">Chave PIX</p>
            <p className="text-sm font-medium text-ink">{pixKey}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-brand-green" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-stone text-center">
        O pagamento via PIX e aprovado em ate 2 minutos.
      </p>
    </div>
  );
}
