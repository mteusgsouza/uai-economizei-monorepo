"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { CustomerProfile } from "@/types/order";

export interface ProfilePatch {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const PROFILE_KEY = ["customer", "profile"] as const;

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
