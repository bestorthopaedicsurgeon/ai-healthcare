"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { API_CONSTANTS } from "@/lib/api-constants";
import { useRouter, usePathname } from "next/navigation";

export interface Physician {
  id: string;
  email: string;
  full_name: string;
  specialty: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  physician: Physician | null;
  token: string | null;
  isLoading: boolean;
  showReloginModal: boolean;
  setShowReloginModal: (show: boolean) => void;
  login: (email: string, password: string, redirect?: boolean) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localStorage keys
const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";
const LS_PHYSICIAN = "physician";

interface TokenPair {
  access_token: string;
  refresh_token: string;
  physician: Physician;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [physician, setPhysician] = useState<Physician | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReloginModal, setShowReloginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Refresh mutex: when one request triggers a refresh, every other
  // 401-caught request awaits the same in-flight promise instead of
  // firing N parallel refresh calls.
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(LS_ACCESS);
    const storedPhysician = localStorage.getItem(LS_PHYSICIAN);

    if (storedToken) {
      setToken(storedToken);
      if (storedPhysician) {
        try {
          setPhysician(JSON.parse(storedPhysician));
        } catch {
          // Corrupted localStorage entry — treat as logged out
          localStorage.removeItem(LS_PHYSICIAN);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (pair: TokenPair) => {
    localStorage.setItem(LS_ACCESS, pair.access_token);
    localStorage.setItem(LS_REFRESH, pair.refresh_token);
    localStorage.setItem(LS_PHYSICIAN, JSON.stringify(pair.physician));
    setToken(pair.access_token);
    setPhysician(pair.physician);
  };

  // Update only the access token (refresh response also includes a fresh
  // refresh token — backend rotates).
  const persistTokensOnly = (access_token: string, refresh_token: string) => {
    localStorage.setItem(LS_ACCESS, access_token);
    localStorage.setItem(LS_REFRESH, refresh_token);
    setToken(access_token);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_PHYSICIAN);
    setToken(null);
    setPhysician(null);
  }, []);

  const login = async (email: string, password: string, redirect = true) => {
    const res = await fetch(`${API_CONSTANTS.BASE_URL}${API_CONSTANTS.AUTH_LOGIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.detail || "Login failed");
    }

    persistAuth({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      physician: data.physician,
    });
    if (redirect) {
      router.push("/dashboard");
    }
  };

  const register = async (payload: any) => {
    const res = await fetch(`${API_CONSTANTS.BASE_URL}${API_CONSTANTS.AUTH_REGISTER}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.detail || "Registration failed");
    }

    persistAuth({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      physician: data.physician,
    });
    router.push("/dashboard");
  };

  const logout = async () => {
    // Hit /auth/logout so the backend can clear the HttpOnly cookies.
    // JS can't delete HttpOnly cookies on its own — the server-set
    // Set-Cookie response with Max-Age=0 is the only way to drop them.
    try {
      await fetch(`${API_CONSTANTS.BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Even if the server call fails (offline), still clear local state.
    }
    clearAuth();
    router.push("/login");
  };

  // ----- Refresh interceptor -----
  // Returns the new access token on success, or null on failure.
  // Mutexed so concurrent 401s share one in-flight refresh call.
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const refreshToken = localStorage.getItem(LS_REFRESH);
    if (!refreshToken) return null;

    refreshInFlight.current = (async () => {
      try {
        const res = await fetch(
          `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.AUTH_REFRESH}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.access_token || !data?.refresh_token) return null;
        persistTokensOnly(data.access_token, data.refresh_token);
        return data.access_token as string;
      } catch {
        return null;
      } finally {
        // Release the mutex on the next tick so concurrent awaiters see
        // the resolved value before the slot reopens.
        setTimeout(() => {
          refreshInFlight.current = null;
        }, 0);
      }
    })();

    return refreshInFlight.current;
  }, []);

  // Internal fetch helper. Always sends `credentials: 'include'` so the
  // browser attaches the HttpOnly auth cookie when the backend has set it.
  // Also still sends the Bearer header during the cookie-migration window
  // so the call works whether the backend has migrated or not (the new
  // backend deps.py prefers header over cookie when both are present).
  const doFetch = useCallback(
    async (url: string, options: RequestInit, accessToken: string | null): Promise<Response> => {
      const isFormData = options.body instanceof FormData;
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
      };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      return fetch(
        url.startsWith("http") ? url : `${API_CONSTANTS.BASE_URL}${url}`,
        { ...options, headers, credentials: "include" },
      );
    },
    [],
  );

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const accessToken = localStorage.getItem(LS_ACCESS);
      let response = await doFetch(url, options, accessToken);

      // If we got 401 AND we actually had a token AND we're not already
      // calling /auth/refresh (avoid infinite loop), try one refresh
      // then retry the original request once.
      const isRefreshCall =
        url.includes(API_CONSTANTS.AUTH_REFRESH) ||
        url.includes(API_CONSTANTS.AUTH_LOGIN) ||
        url.includes(API_CONSTANTS.AUTH_REGISTER);

      if (response.status === 401 && accessToken && !isRefreshCall) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry once with the fresh token
          response = await doFetch(url, options, newToken);
          if (response.status !== 401) return response;
        }
        // Refresh failed (or retry still 401) — last resort
        clearAuth();
        setShowReloginModal(true);
      }

      return response;
    },
    [doFetch, refreshAccessToken, clearAuth],
  );

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = pathname === "/login" || pathname === "/signup";
      const isMarketingRoute = pathname === "/" || pathname === "/pricing";

      if (!token && !isAuthRoute && !isMarketingRoute) {
        router.push("/login");
      }
    }
  }, [token, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ physician, token, isLoading, showReloginModal, setShowReloginModal, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
