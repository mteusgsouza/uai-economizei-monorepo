"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@workspace/ui/components/sonner";
import { useCart } from "@/lib/cart-context";
import { useCheckout } from "@/lib/checkout-context";
import { api } from "@/lib/http-client";

/**
 * O envio do pedido, do carrinho até a página de sucesso.
 *
 * No modo orçamento nenhum campo de pagamento viaja: a Nest grava o pedido sem
 * `Payment` e o acerto acontece fora do site. Mandar a forma assim mesmo não
 * seria só inútil — a API a ignora, e dado de cartão não tem por que sair daqui.
 */
export function useOrderSubmit(quoteMode: boolean) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const {
    paymentMethod,
    paymentDetails,
    shippingCost,
    shippingOption,
    address,
    resetCheckout,
  } = useCheckout();

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Esvaziar o carrinho reabre o guard de carrinho vazio da página, que
  // mandaria o cliente de volta para /carrinho no meio da navegação. Este
  // sinal não volta atrás: dali em diante a página só está de saída.
  const [isDone, setIsDone] = useState(false);

  // `api.post` só faz cast do JSON, sem validar: o tipo aqui era
  // `{ id: number }[]` e a Nest devolve **um** pedido. O `.map` estourava
  // depois do 201 e caía no catch — o pedido entrava e o cliente via erro.
  const submit = async () => {
    const pickup = shippingOption === "pickup";
    setIsSubmitting(true);
    try {
      const order = await api.post<{ id: number }>("/orders", {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        // O pedido guarda a própria cópia do endereço — daqui para frente ele
        // não muda se o cliente mexer na agenda dele. Na retirada não vai
        // endereço nenhum: é o que separa retirada de entrega no banco.
        address: pickup ? null : address,
        retiraBalcao: pickup,
        cepValue: shippingCost,
        ...(quoteMode
          ? {}
          : { paymentMethod, paymentDetails: JSON.stringify(paymentDetails) }),
      });

      setIsDone(true);
      clearCart();
      resetCheckout();
      toast.success(
        quoteMode ? "Pedido enviado com sucesso!" : "Pedido realizado com sucesso!",
      );
      router.push(`/carrinho/sucesso?orderId=${order.id}`);
    } catch {
      toast.error(
        quoteMode
          ? "Erro ao enviar o pedido. Tente novamente."
          : "Erro ao processar pagamento. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, isDone };
}
