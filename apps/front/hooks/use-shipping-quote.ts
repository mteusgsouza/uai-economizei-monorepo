"use client";

import { useEffect, useState } from "react";
import { lookupShipping, type ShippingQuote } from "@/lib/shipping";
import { onlyDigits } from "@/lib/viacep";

/**
 * Busca o frete na tabela da loja conforme o CEP é preenchido.
 * Enquanto o CEP não estiver completo, não há valor algum — antes disso
 * o checkout mostrava preços fixos que não vinham da tabela.
 */
export function useShippingQuote(cep: string): ShippingQuote {
  const [quote, setQuote] = useState<ShippingQuote>({ status: "idle" });
  const digits = onlyDigits(cep);

  useEffect(() => {
    if (digits.length !== 8) {
      setQuote({ status: "idle" });
      return;
    }

    let active = true;
    setQuote({ status: "loading" });

    lookupShipping(digits).then((result) => {
      // Descarta a resposta se o CEP já mudou
      if (active) setQuote(result);
    });

    return () => {
      active = false;
    };
  }, [digits]);

  return quote;
}
