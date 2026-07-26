"use client";

import { useState } from "react";
import { Check, Package, ShoppingCart } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useCart } from "@/lib/cart-context";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import type { Product } from "@/types/product";

/** Painel interativo de compra (estoque, quantidade, carrinho) do detalhe do produto. */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="mt-8 space-y-4 rounded-lg border border-hairline p-6">
      <div className="flex items-center gap-2 text-sm text-steel">
        <Package className="h-4 w-4" />
        {product.stock > 0 ? (
          <span>{product.stock} unidades disponiveis</span>
        ) : (
          <span className="text-brand-error">Fora de estoque</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-steel">Quantidade</span>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={product.stock}
        />
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full gap-2"
        disabled={product.stock === 0}
      >
        {addedToCart ? (
          <>
            <Check className="h-4 w-4" />
            Adicionado!
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Adicionar ao carrinho
          </>
        )}
      </Button>
    </div>
  );
}
