"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cartSubtotal, effectiveShipping } from "@/lib/commerce";
import { useCart } from "@/lib/cart-context";
import { useStoreSettings } from "@/lib/store-settings-context";

export interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/** Entrega no endereco (valor vem da tabela de CEP) ou retirada no balcao. */
export type ShippingOption = "delivery" | "pickup";
export type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO";

export interface PaymentDetails {
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
  installments?: string;
}

interface CheckoutContextValue {
  step: "cart" | "address" | "payment";
  setStep: (step: "cart" | "address" | "payment") => void;
  address: AddressData | null;
  /** `null` na retirada: não há endereço de entrega a guardar. */
  setAddress: (address: AddressData | null) => void;
  shippingOption: ShippingOption;
  setShippingOption: (option: ShippingOption) => void;
  /** Em centavos; para entrega vem da faixa de CEP, retirada e zero. */
  shippingCost: number;
  setDeliveryQuote: (value: number | null) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  paymentDetails: PaymentDetails;
  setPaymentDetails: (details: PaymentDetails) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const STORAGE_KEY = "store-checkout";

function loadCheckout(): Partial<{
  step: string;
  address: AddressData;
  shippingOption: ShippingOption;
  deliveryQuote: number | null;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
}> {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // corrupted
  }
  return {};
}

function saveCheckout(state: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full
  }
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const saved = loadCheckout();
  // `CartProvider` e `StoreSettingsProvider` ficam acima deste na arvore do
  // layout — sem isso o frete grátis nao teria como ser calculado aqui.
  const { items } = useCart();
  const settings = useStoreSettings();

  const [step, setStepState] = useState<"cart" | "address" | "payment">(
    (saved.step as "cart" | "address" | "payment") ?? "cart",
  );
  const [address, setAddressState] = useState<AddressData | null>(saved.address ?? null);
  const [shippingOption, setShippingOptionState] = useState<ShippingOption>(
    saved.shippingOption ?? "delivery",
  );
  // Valor da faixa de CEP; null enquanto o cliente nao informou um CEP atendido
  const [deliveryQuote, setDeliveryQuoteState] = useState<number | null>(
    typeof saved.deliveryQuote === "number" ? saved.deliveryQuote : null,
  );
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>(
    saved.paymentMethod ?? "CREDIT_CARD",
  );
  const [paymentDetails, setPaymentDetailsState] = useState<PaymentDetails>(
    saved.paymentDetails ?? {},
  );

  const persist = useCallback(
    (updates: Record<string, unknown>) => {
      const snapshot = {
        step,
        address,
        shippingOption,
        deliveryQuote,
        paymentMethod,
        paymentDetails,
        ...updates,
      };
      saveCheckout(snapshot);
    },
    [step, address, shippingOption, deliveryQuote, paymentMethod, paymentDetails],
  );

  const setStep = useCallback(
    (s: "cart" | "address" | "payment") => {
      setStepState(s);
      persist({ step: s });
    },
    [persist],
  );

  const setAddress = useCallback(
    (a: AddressData | null) => {
      setAddressState(a);
      persist({ address: a });
    },
    [persist],
  );

  const setShippingOption = useCallback(
    (opt: ShippingOption) => {
      setShippingOptionState(opt);
      persist({ shippingOption: opt });
    },
    [persist],
  );

  const setDeliveryQuote = useCallback(
    (value: number | null) => {
      setDeliveryQuoteState(value);
      persist({ deliveryQuote: value });
    },
    [persist],
  );

  const setPaymentMethod = useCallback(
    (m: PaymentMethod) => {
      setPaymentMethodState(m);
      persist({ paymentMethod: m });
    },
    [persist],
  );

  const setPaymentDetails = useCallback(
    (d: PaymentDetails) => {
      setPaymentDetailsState(d);
      persist({ paymentDetails: d });
    },
    [persist],
  );

  const resetCheckout = useCallback(() => {
    setStepState("cart");
    setAddressState(null);
    setShippingOptionState("delivery");
    setDeliveryQuoteState(null);
    setPaymentMethodState("CREDIT_CARD");
    setPaymentDetailsState({});
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Retirada nao tem frete; entrega so tem valor apos consultar o CEP — e o
  // frete gratis zera o que a faixa cobraria. Aplicado aqui, e nao em cada
  // tela, porque era exatamente esse o bug: a barra do carrinho anunciava
  // "frete gratis liberado" e o fechamento cobrava assim mesmo.
  const quoted = shippingOption === "pickup" ? 0 : (deliveryQuote ?? 0);
  const shippingCost = effectiveShipping(cartSubtotal(items), quoted, settings);

  return (
    <CheckoutContext.Provider
      value={{
        step,
        setStep,
        address,
        setAddress,
        shippingOption,
        setShippingOption,
        shippingCost,
        setDeliveryQuote,
        paymentMethod,
        setPaymentMethod,
        paymentDetails,
        setPaymentDetails,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
