import { createContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { HttpClient } from "../lib/http-client";
import { auth } from "../lib/firebase";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  picture: string | null;
}

interface AuthContextValue {
  user: User | null;
  idToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  loginWithFirebase: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

function firebaseErrorMessage(error: FirebaseError): string {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Email ou senha inválidos";
    case "auth/user-not-found":
      return "Usuário não encontrado";
    case "auth/email-already-in-use":
      return "Este email já está cadastrado";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres";
    case "auth/invalid-email":
      return "Email inválido";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet";
    default:
      return "Erro ao autenticar. Tente novamente";
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [idToken, setIdToken] = useState<string | null>(
    () => localStorage.getItem("firebaseIdToken")
  );

  const httpClient = useMemo(
    () =>
      new HttpClient({
        baseUrl: API_URL,
        getAccessToken: () => localStorage.getItem("firebaseIdToken"),
        onUnauthorized: () => {
          localStorage.removeItem("firebaseIdToken");
          localStorage.removeItem("wasLoggedIn");
          setIdToken(null);
          queryClient.setQueryData(["auth", "me"], null);
        },
        refreshToken: async () => null,
      }),
    [queryClient]
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"] as const,
    queryFn: () =>
      httpClient.get<{ customer: User }>("/auth/customer/me").then((r) => r.customer),
    enabled: !!idToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { isFetching: isRefreshing } = useQuery({
    queryKey: ["auth", "refresh"] as const,
    queryFn: async () => {
      const storedToken = localStorage.getItem("firebaseIdToken");
      if (!storedToken) throw new Error("No stored token");
      return httpClient.get<{ customer: User }>("/auth/customer/me").then((r) => r.customer);
    },
    enabled: !idToken && !!localStorage.getItem("wasLoggedIn"),
    retry: false,
    staleTime: Infinity,
  });

  const loginWithFirebase = useCallback(
    async (token: string) => {
      localStorage.setItem("firebaseIdToken", token);
      localStorage.setItem("wasLoggedIn", "1");
      setIdToken(token);

      const data = await httpClient.post<{ customer: User }>(
        "/auth/customer/login",
        { idToken: token }
      );
      queryClient.setQueryData(["auth", "me"], data.customer);
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
    localStorage.removeItem("firebaseIdToken");
    localStorage.removeItem("wasLoggedIn");
    setIdToken(null);
    queryClient.removeQueries();
  }, [queryClient]);

  const refreshAuth = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }).then(() => {}),
    [queryClient]
  );

  const isAuthenticated = !!user;

  const value: AuthContextValue = {
    user: user ?? null,
    idToken,
    isLoading: isLoading || isRefreshing,
    isAuthenticated,
    login,
    register,
    loginWithFirebase,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, AuthContext, type User };
