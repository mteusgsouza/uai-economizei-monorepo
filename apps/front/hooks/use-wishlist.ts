"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/sonner";
import { api } from "@/lib/http-client";
import { withRedirect } from "@/lib/auth-redirect";
import { useAuth } from "@/lib/use-auth";

const WISHLIST_KEY = ["customer", "wishlist"] as const;

/**
 * Favoritos da conta. Antes viviam em `localStorage`, o que fazia a lista sumir
 * ao trocar de navegador — e a página de favoritos já exigia login de qualquer
 * forma. Agora a fonte da verdade é a API, e sem login não há lista: o coração
 * leva para a tela de entrar, preservando de onde a pessoa veio.
 */
export function useWishlist() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery<number[]>({
    queryKey: WISHLIST_KEY,
    queryFn: () => api.get<number[]>("/customers/me/wishlist"),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  // `data ?? []` cru criaria um array novo a cada render, e com ele novas
  // identidades para `isInWishlist` e `toggle` — memoização que não memoiza.
  const ids = useMemo(() => data ?? [], [data]);

  const { mutate } = useMutation({
    mutationFn: ({ productId, saved }: { productId: number; saved: boolean }) =>
      saved
        ? api.delete(`/customers/me/wishlist/${productId}`)
        : api.post("/customers/me/wishlist", { productId }),
    // Otimista: o coração precisa responder no clique, não no round-trip.
    onMutate: async ({ productId, saved }) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      const previous = queryClient.getQueryData<number[]>(WISHLIST_KEY) ?? [];
      queryClient.setQueryData<number[]>(
        WISHLIST_KEY,
        saved
          ? previous.filter((id) => id !== productId)
          : [...previous, productId],
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(WISHLIST_KEY, context?.previous ?? []);
      toast.error("Não foi possível atualizar seus favoritos.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });

  const isInWishlist = useCallback(
    (productId: number) => ids.includes(productId),
    [ids],
  );

  const toggle = useCallback(
    (productId: number) => {
      if (!isAuthenticated) {
        toast.info("Entre na sua conta para salvar favoritos.");
        router.push(withRedirect("/login", pathname));
        return;
      }
      mutate({ productId, saved: ids.includes(productId) });
    },
    [isAuthenticated, ids, mutate, router, pathname],
  );

  const remove = useCallback(
    (productId: number) => {
      if (!isAuthenticated) return;
      mutate({ productId, saved: true });
    },
    [isAuthenticated, mutate],
  );

  return { ids, isInWishlist, toggle, remove };
}
