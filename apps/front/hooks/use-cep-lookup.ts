"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isCompleteCep, lookupCep, onlyDigits, type CepAddress } from "@/lib/viacep";

export type CepStatus = "idle" | "loading" | "found" | "not-found" | "error";

interface UseCepLookupArgs {
  cep: string;
  /** Chamado quando o CEP é encontrado, para preencher os campos. */
  onFound: (address: CepAddress) => void;
  /** Chamado quando a consulta anterior preencheu campos que não valem mais. */
  onClear: () => void;
}

export interface CepLookupState {
  status: CepStatus;
  /** Campos que o ViaCEP preencheu ficam travados; o resto é livre. */
  lockedFields: { street: boolean; neighborhood: boolean; city: boolean; state: boolean };
  message: string | null;
}

const ALL_FREE = { street: false, neighborhood: false, city: false, state: false };

/**
 * Busca o endereço no ViaCEP conforme o CEP é digitado.
 *
 * Enquanto não há resultado, os campos ficam livres — se a consulta falhar ou o
 * CEP não existir, a pessoa ainda precisa conseguir comprar preenchendo à mão.
 */
export function useCepLookup({ cep, onFound, onClear }: UseCepLookupArgs): CepLookupState {
  const [status, setStatus] = useState<CepStatus>("idle");
  const [lockedFields, setLockedFields] = useState(ALL_FREE);

  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;

  /** Se o endereço na tela veio de uma consulta, ele não vale para outro CEP. */
  const filledByLookupRef = useRef(false);

  const digits = onlyDigits(cep);

  const runLookup = useCallback(async (value: string, signal: AbortSignal) => {
    setStatus("loading");
    const result = await lookupCep(value, signal);
    if (signal.aborted) return;

    if (result.status === "found") {
      onFoundRef.current(result.address);
      filledByLookupRef.current = true;
      setStatus("found");
      // Cidades sem logradouro por faixa voltam sem rua/bairro: liberar os dois
      setLockedFields({
        street: Boolean(result.address.street),
        neighborhood: Boolean(result.address.neighborhood),
        city: Boolean(result.address.city),
        state: Boolean(result.address.state),
      });
      return;
    }

    // Limpa o endereço da consulta anterior, senão a pessoa enviaria os dados
    // de outro CEP sem perceber. O que ela digitou à mão é preservado.
    if (filledByLookupRef.current) {
      onClearRef.current();
      filledByLookupRef.current = false;
    }

    setStatus(result.status === "not-found" ? "not-found" : "error");
    setLockedFields(ALL_FREE);
  }, []);

  useEffect(() => {
    if (!isCompleteCep(digits)) {
      setStatus("idle");
      setLockedFields(ALL_FREE);
      return;
    }

    // Descarta a resposta anterior: sem isso um CEP antigo sobrescreve o atual
    const controller = new AbortController();
    void runLookup(digits, controller.signal);
    return () => controller.abort();
  }, [digits, runLookup]);

  const message =
    status === "loading"
      ? "Buscando endereco..."
      : status === "not-found"
        ? "CEP nao encontrado. Preencha o endereco manualmente."
        : status === "error"
          ? "Nao foi possivel consultar o CEP. Preencha o endereco manualmente."
          : null;

  return { status, lockedFields, message };
}
