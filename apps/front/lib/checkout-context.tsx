"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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

export type ShippingOption = "standard" | "express" | "pickup";
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
  setAddress: (address: AddressData) => void;
  shippingOption: ShippingOption;
  setShippingOption: (option: ShippingOption) => void;
  shippingCost: number;
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
  shippingCost: number;
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

const SHIPPING_PRICES: Record<ShippingOption, number> = {
  standard: 15.0,
  express: 29.9,
  pickup: 0,
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const saved = loadCheckout();

  const [step, setStepState] = useState<"cart" | "address" | "payment">(
    (saved.step as "cart" | "address" | "payment") ?? "cart",
  );
  const [address, setAddressState] = useState<AddressData | null>(saved.address ?? null);
  const [shippingOption, setShippingOptionState] = useState<ShippingOption>(
    saved.shippingOption ?? "standard",
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
        shippingCost: SHIPPING_PRICES[shippingOption],
        paymentMethod,
        paymentDetails,
        ...updates,
      };
      saveCheckout(snapshot);
    },
    [step, address, shippingOption, paymentMethod, paymentDetails],
  );

  const setStep = useCallback(
    (s: "cart" | "address" | "payment") => {
      setStepState(s);
      persist({ step: s });
    },
    [persist],
  );

  const setAddress = useCallback(
    (a: AddressData) => {
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
    setShippingOptionState("standard");
    setPaymentMethodState("CREDIT_CARD");
    setPaymentDetailsState({});
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const shippingCost = SHIPPING_PRICES[shippingOption];

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
