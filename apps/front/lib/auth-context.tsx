'use client';

import { createContext, useState, useMemo, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HttpClient } from './http-client';

export interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  picture: string | null;
}

export interface AuthContextValue {
  customer: Customer | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }
    return null;
  });

  const httpClient = useMemo(
    () =>
      new HttpClient({
        baseUrl: API_URL,
        getAccessToken: () => {
          if (typeof window !== 'undefined') {
            return sessionStorage.getItem('accessToken');
          }
          return null;
        },
        onUnauthorized: () => {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('accessToken');
            localStorage.removeItem('wasLoggedIn');
            clearCookie('logged_in');
          }
          setAccessToken(null);
          queryClient.setQueryData(['customer-auth', 'me'], null);
        },
        refreshToken: async () => {
          try {
            const response = await fetch(`${API_URL}/auth/customer/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (!response.ok) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('wasLoggedIn');
                clearCookie('logged_in');
              }
              return null;
            }
            const data = (await response.json()) as { accessToken: string; customer: Customer };
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('wasLoggedIn', '1');
              setCookie('logged_in', '1', 7);
            }
            setAccessToken(data.accessToken);
            queryClient.setQueryData(['customer-auth', 'me'], data.customer);
            return data.accessToken;
          } catch {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('wasLoggedIn');
              clearCookie('logged_in');
            }
            return null;
          }
        },
      }),
    [queryClient],
  );

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer-auth', 'me'] as const,
    queryFn: () =>
      httpClient.get<{ customer: Customer }>('/auth/customer/me').then((r) => r.customer),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const wasLoggedIn =
    typeof window !== 'undefined' ? !!localStorage.getItem('wasLoggedIn') : false;

  const { isFetching: isRefreshing } = useQuery({
    queryKey: ['customer-auth', 'refresh'] as const,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/auth/customer/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wasLoggedIn');
          clearCookie('logged_in');
        }
        throw new Error('Refresh failed');
      }
      const data = (await response.json()) as { accessToken: string; customer: Customer };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('wasLoggedIn', '1');
        setCookie('logged_in', '1', 7);
      }
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['customer-auth', 'me'], data.customer);
      return data;
    },
    enabled: !accessToken && wasLoggedIn,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      httpClient.post<{ accessToken: string; customer: Customer }>('/auth/customer/login', body),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('wasLoggedIn', '1');
        setCookie('logged_in', '1', 7);
      }
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['customer-auth', 'me'], data.customer);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) =>
      httpClient.post<{ accessToken: string; customer: Customer }>(
        '/auth/customer/register',
        body,
      ),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('wasLoggedIn', '1');
        setCookie('logged_in', '1', 7);
      }
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['customer-auth', 'me'], data.customer);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: (credential: string) =>
      httpClient.post<{ accessToken: string; customer: Customer }>('/auth/customer/google', {
        credential,
      }),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('wasLoggedIn', '1');
        setCookie('logged_in', '1', 7);
      }
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['customer-auth', 'me'], data.customer);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => httpClient.post('/auth/customer/logout'),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('wasLoggedIn');
        clearCookie('logged_in');
      }
      setAccessToken(null);
      queryClient.removeQueries();
    },
  });

  const value: AuthContextValue = {
    customer: customer ?? null,
    accessToken,
    isLoading: isLoading || isRefreshing,
    isAuthenticated: !!customer,
    login: (email, password) =>
      loginMutation.mutateAsync({ email, password }).then(() => {}),
    register: (email, password, firstName, lastName) =>
      registerMutation.mutateAsync({ email, password, firstName, lastName }).then(() => {}),
    loginWithGoogle: (credential) =>
      googleLoginMutation.mutateAsync(credential).then(() => {}),
    logout: () => logoutMutation.mutateAsync().then(() => {}),
    refreshAuth: () =>
      queryClient.invalidateQueries({ queryKey: ['customer-auth', 'me'] }).then(() => {}),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
