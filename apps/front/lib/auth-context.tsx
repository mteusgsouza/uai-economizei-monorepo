"use client";

import { createContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HttpClient } from "./http-client";

export interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  picture: string | null;
  phone: string | null;
  verifiedUser: boolean;
}

export interface AuthContextValue {
  customer: Customer | null;
  idToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithFirebase: (idToken: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [idToken, setIdToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("firebaseIdToken");
    }
    return null;
  });

  const httpClient = useMemo(
    () =>
      new HttpClient({
        baseUrl: API_URL,
        getAccessToken: () => {
          if (typeof window !== "undefined") {
            return sessionStorage.getItem("firebaseIdToken");
          }
          return null;
        },
        onUnauthorized: () => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("firebaseIdToken");
            sessionStorage.removeItem("wasLoggedIn");
          }
          setIdToken(null);
          queryClient.setQueryData(["customer-auth", "me"], null);
        },
        refreshToken: async () => null,
      }),
    [queryClient]
  );

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer-auth", "me"] as const,
    queryFn: () =>
      httpClient
        .get<{ customer: Customer }>("/auth/customer/me")
        .then((r) => r.customer),
    enabled: !!idToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const wasLoggedIn =
    typeof window !== "undefined"
      ? !!sessionStorage.getItem("wasLoggedIn")
      : false;

  // Try to restore session from stored token
  const { isFetching: isRestoring } = useQuery({
    queryKey: ["customer-auth", "restore"] as const,
    queryFn: async () => {
      const storedToken = sessionStorage.getItem("firebaseIdToken");
      if (!storedToken) throw new Error("No stored token");
      return httpClient
        .get<{ customer: Customer }>("/auth/customer/me")
        .then((r) => r.customer);
    },
    enabled: !idToken && wasLoggedIn,
    retry: false,
    staleTime: Infinity,
  });

  const loginWithFirebase = useCallback(
    async (token: string) => {
      // Store Firebase ID token
      if (typeof window !== "undefined") {
        sessionStorage.setItem("firebaseIdToken", token);
        sessionStorage.setItem("wasLoggedIn", "1");
      }
      setIdToken(token);

      // Register/login on backend
      const data = await httpClient.post<{ customer: Customer }>(
        "/auth/customer/login",
        { idToken: token }
      );
      queryClient.setQueryData(["customer-auth", "me"], data.customer);
    },
    [httpClient, queryClient]
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      return loginWithFirebase(credential);
    },
    [loginWithFirebase]
  );

  const login = useCallback(
    async (_email: string, _password: string) => {
      throw new Error("Email/password login requires Firebase client SDK. Use Google Sign-In or provide a Firebase ID token.");
    },
    []
  );

  const register = useCallback(
    async (_email: string, _password: string, _firstName?: string, _lastName?: string) => {
      throw new Error("Email/password registration requires Firebase client SDK. Use Google Sign-In or provide a Firebase ID token.");
    },
    []
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("firebaseIdToken");
      sessionStorage.removeItem("wasLoggedIn");
    }
    setIdToken(null);
    queryClient.removeQueries();
  }, [queryClient]);

  const refreshAuth = useCallback(
    () =>
      queryClient
        .invalidateQueries({ queryKey: ["customer-auth", "me"] })
        .then(() => {}),
    [queryClient]
  );

  const value: AuthContextValue = {
    customer: customer ?? null,
    idToken,
    isLoading: isLoading || isRestoring,
    isAuthenticated: !!customer,
    loginWithFirebase,
    loginWithGoogle,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
