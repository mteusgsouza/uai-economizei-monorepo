import { createContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HttpClient } from "../lib/http-client";

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
  loginWithFirebase: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
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
    loginWithFirebase,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, AuthContext, type User };
