const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

class HttpClient {
  private baseUrl: string;
  private getAccessToken: () => string | null;
  private onUnauthorized: () => void;
  private refreshToken: () => Promise<string | null>;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: {
    baseUrl: string;
    getAccessToken: () => string | null;
    onUnauthorized: () => void;
    refreshToken?: () => Promise<string | null>;
  }) {
    this.baseUrl = config.baseUrl;
    this.getAccessToken = config.getAccessToken;
    this.onUnauthorized = config.onUnauthorized;
    this.refreshToken = config.refreshToken ?? (() => Promise.resolve(null));
  }

  private isAuthRoute(path: string): boolean {
    const authRoutes = ['/auth/refresh', '/auth/customer/refresh', '/auth/login', '/auth/customer/login', '/auth/register', '/auth/customer/register'];
    return authRoutes.some((route) => path.startsWith(route));
  }

  private async tryRefresh(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.refreshToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const doFetch = (token: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    };

    const token = this.getAccessToken();
    const response = await doFetch(token);

    if (response.status === 401 && !this.isAuthRoute(path)) {
      const newToken = await this.tryRefresh();

      if (newToken) {
        const retryResponse = await doFetch(newToken);

        if (retryResponse.ok) {
          return retryResponse.json() as Promise<T>;
        }

        if (retryResponse.status === 401) {
          this.onUnauthorized();
          throw new Error('Unauthorized');
        }

        const retryError = await retryResponse.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(retryError.message || 'Request failed');
      }

      this.onUnauthorized();
      throw new Error('Unauthorized');
    }

    if (response.status === 401) {
      this.onUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export { HttpClient, type RequestOptions };
export const api = new HttpClient({
  baseUrl: API_URL,
  getAccessToken: () => localStorage.getItem('firebaseIdToken'),
  onUnauthorized: () => {},
});
