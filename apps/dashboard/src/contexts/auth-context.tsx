import { createContext, useState, useMemo, type ReactNode } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { HttpClient } from "../lib/http-client"

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  picture: string | null
}

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem("accessToken"),
  )

  const httpClient = useMemo(
    () =>
      new HttpClient({
        baseUrl: API_URL,
        getAccessToken: () => localStorage.getItem("accessToken"),
        onUnauthorized: () => {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("wasLoggedIn")
          setAccessToken(null)
          queryClient.setQueryData(["auth", "me"], null)
        },
      }),
    [queryClient],
  )

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"] as const,
    queryFn: () => httpClient.get<{ user: User }>("/auth/me").then((r) => r.user),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const { isFetching: isRefreshing } = useQuery({
    queryKey: ["auth", "refresh"] as const,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) {
        localStorage.removeItem("wasLoggedIn")
        throw new Error("Refresh failed")
      }
      const data = (await response.json()) as { accessToken: string; user: User }
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("wasLoggedIn", "1")
      setAccessToken(data.accessToken)
      queryClient.setQueryData(["auth", "me"], data.user)
      return data
    },
    enabled: !accessToken && !!localStorage.getItem("wasLoggedIn"),
    retry: false,
    staleTime: Infinity,
  })

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      httpClient.post<{ accessToken: string; user: User }>("/auth/login", body),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("wasLoggedIn", "1")
      setAccessToken(data.accessToken)
      queryClient.setQueryData(["auth", "me"], data.user)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (body: {
      email: string
      password: string
      firstName?: string
      lastName?: string
    }) => httpClient.post<{ accessToken: string; user: User }>("/auth/register", body),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("wasLoggedIn", "1")
      setAccessToken(data.accessToken)
      queryClient.setQueryData(["auth", "me"], data.user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => httpClient.post("/auth/logout"),
    onSuccess: () => {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("wasLoggedIn")
      setAccessToken(null)
      queryClient.removeQueries()
    },
  })

  const isAuthenticated = !!user

  const value: AuthContextValue = {
    user: user ?? null,
    accessToken,
    isLoading: isLoading || isRefreshing,
    isAuthenticated,
    login: (email, password) => loginMutation.mutateAsync({ email, password }).then(() => {}),
    register: (email, password, firstName, lastName) =>
      registerMutation.mutateAsync({ email, password, firstName, lastName }).then(() => {}),
    logout: () => logoutMutation.mutateAsync().then(() => {}),
    refreshAuth: () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] }).then(() => {}),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider, AuthContext, type User }
