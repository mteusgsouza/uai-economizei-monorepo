"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { CustomerAddress, CustomerProfile } from "@/types/order";

export interface ProfilePatch {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AddressPayload {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const PROFILE_KEY = ["customer", "profile"] as const;
const ADDRESSES_KEY = ["customer", "addresses"] as const;

/** Ficha do cliente na Nest — mais completa que o `customer` do AuthContext. */
export function useProfile(enabled = true) {
  return useQuery<CustomerProfile>({
    queryKey: PROFILE_KEY,
    queryFn: () => api.get<CustomerProfile>("/customers/me"),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ProfilePatch) =>
      api.patch<CustomerProfile>("/customers/me", patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      // O nome no cabeçalho vem do AuthContext, que tem cache próprio.
      void queryClient.invalidateQueries({ queryKey: ["customer-auth", "me"] });
    },
  });
}

export function useAddresses(enabled = true) {
  return useQuery<CustomerAddress[]>({
    queryKey: ADDRESSES_KEY,
    queryFn: () => api.get<CustomerAddress[]>("/customers/me/addresses"),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddressPayload) =>
      api.post<CustomerAddress>("/customers/me/addresses", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}
