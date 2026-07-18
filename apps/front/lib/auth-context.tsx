"use client";

import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onIdTokenChanged,
  signOut,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { HttpClient } from "./http-client";
import { auth } from "./firebase";
import { firebaseErrorMessage } from "./firebase-errors";

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
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Mantém o token fresco: o Firebase renova o ID token automaticamente (~1h)
  // e restaura a sessão persistida ao reabrir o site. O token é espelhado no
  // sessionStorage, de onde o HttpClient (inclusive o singleton `api`) o lê.
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        sessionStorage.setItem("firebaseIdToken", token);
        setIdToken(token);
      } else {
        sessionStorage.removeItem("firebaseIdToken");
        sessionStorage.removeItem("wasLoggedIn");
        setIdToken(null);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

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
          void signOut(auth).catch(() => {});
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("firebaseIdToken");
          }
          setIdToken(null);
          queryClient.setQueryData(["customer-auth", "me"], null);
        },
        refreshToken: async () => {
          const user = auth.currentUser;
          if (!user) return null;
          try {
            const token = await user.getIdToken(true);
            sessionStorage.setItem("firebaseIdToken", token);
            return token;
          } catch {
            return null;
          }
        },
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

  const loginWithFirebase = useCallback(
    async (token: string) => {
      // Store Firebase ID token
      if (typeof window !== "undefined") {
        sessionStorage.setItem("firebaseIdToken", token);
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

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        await loginWithFirebase(token);
      } catch (error) {
        if (error instanceof FirebaseError) {
          throw new Error(firebaseErrorMessage(error));
        }
        throw error;
      }
    },
    [loginWithFirebase]
  );

  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        const token = await userCredential.user.getIdToken();
        await loginWithFirebase(token);
      } catch (error) {
        if (error instanceof FirebaseError) {
          throw new Error(firebaseErrorMessage(error));
        }
        throw error;
      }
    },
    [loginWithFirebase]
  );

  const logout = useCallback(() => {
    void signOut(auth).catch(() => {});
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
    isLoading: !isAuthReady || isLoading,
    isAuthenticated: !!customer,
    loginWithFirebase,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
