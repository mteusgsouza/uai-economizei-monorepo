"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import type { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
}

/** Quanto tempo o botão fica em "Adicionando…" — só o suficiente para o
 *  clique ter resposta visível; o carrinho é local e resolve na hora. */
const FEEDBACK_MS = 700;

/**
 * O botão de compra do sistema, com os três estados do mockup: disponível,
 * "Adicionando…" com spinner e "Indisponível" desabilitado. Centraliza o que
 * antes cada cartão resolvia por conta própria.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  label = "Adicionar",
  className,
  size = "default",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const outOfStock = product.stock <= 0;

  function handleClick() {
    if (outOfStock || adding) return;
    addItem(product, quantity);
    setAdding(true);
    timer.current = setTimeout(() => setAdding(false), FEEDBACK_MS);
  }

  // Depois do filtro de disponibilidade nenhuma listagem chega aqui
  // esgotada; quem chega é o card da wishlist, que mostra esgotado de
  // propósito. Ali um botão desabilitado é só um alvo morto.
  if (outOfStock) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center border border-divider px-4 py-2 text-center text-sm text-ink/55",
          className,
        )}
      >
        Produto indisponível
      </span>
    );
  }

  return (
    <Button className={className} size={size} disabled={adding} onClick={handleClick}>
      {adding && <Spinner className="size-3.5" />}
      {adding ? "Adicionando…" : label}
    </Button>
  );
}
