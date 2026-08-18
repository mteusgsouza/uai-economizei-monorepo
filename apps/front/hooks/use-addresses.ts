"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { CustomerAddress } from "@/types/order";
import { PROFILE_KEY } from "./use-account";

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

const ADDRESSES_KEY = ["customer", "addresses"] as const;

export function useAddresses(enabled = true) {
  return useQuery<CustomerAddress[]>({
    queryKey: ADDRESSES_KEY,
    queryFn: () => api.get<CustomerAddress[]>("/customers/me/addresses"),
    enabled,
    staleTime: 60 * 1000,
  });
}

/** Escolha do checkout: o marcado como padrão ou, na falta dele, o primeiro. */
export function defaultAddress(addresses?: CustomerAddress[]) {
  return addresses?.find((address) => address.isDefault) ?? addresses?.[0] ?? null;
}

/**
 * Toda gravação de endereço mexe na lista e no perfil, que embute os endereços.
 * A Nest deduplica pela chave normalizada, então salvar de novo o mesmo endereço
 * devolve a linha que já existia — a lista não cresce.
 */
function useAddressMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useCreateAddress() {
  return useAddressMutation((payload: AddressPayload) =>
    api.post<CustomerAddress>("/customers/me/addresses", payload),
  );
}

export function useUpdateAddress() {
  return useAddressMutation(({ id, ...payload }: AddressPayload & { id: number }) =>
    api.patch<CustomerAddress>(`/customers/me/addresses/${id}`, payload),
  );
}

export function useDeleteAddress() {
  return useAddressMutation((id: number) =>
    api.delete<{ id: number }>(`/customers/me/addresses/${id}`),
  );
}

export function useSetDefaultAddress() {
  return useAddressMutation((id: number) =>
    api.patch<CustomerAddress[]>(`/customers/me/addresses/${id}/default`),
  );
}
