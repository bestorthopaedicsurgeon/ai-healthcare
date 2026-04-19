"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [physician, setPhysician] = useState<Physician | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReloginModal, setShowReloginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedPhysician = localStorage.getItem("physician");
    
    if (storedToken) {
      setToken(storedToken);
      if (storedPhysician) {
        setPhysician(JSON.parse(storedPhysician));
      }
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (access_token: string, doc: Physician) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("physician", JSON.stringify(doc));
    setToken(access_token);
    setPhysician(doc);
  };

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

    persistAuth(data.access_token, data.physician);
    if (redirect) {
      router.push("/triage");
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

    persistAuth(data.access_token, data.physician);
    router.push("/triage");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("physician");
    setToken(null);
    setPhysician(null);
    router.push("/login");
  };

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const currentToken = localStorage.getItem("access_token");
    
    // Create headers specifically handling json mostly if not FormData
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }
    
    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url.startsWith('http') ? url : `${API_CONSTANTS.BASE_URL}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      setShowReloginModal(true);
    }

    return response;
  };

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
