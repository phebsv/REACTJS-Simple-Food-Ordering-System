// src/context/AuthContext.tsx
// Manages customer auth state - token + user stored in localStorage

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { loginCustomer, registerCustomer } from "../services/api.ts";
import type { AuthUser } from "../services/api.ts";
import { getStoredItem, removeStoredItem, setStoredItem } from "../utils/storage";

interface AuthContextType {
  customer: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrating: boolean;
  loading: boolean;
  error: string;
  login: (
    email: string,
    password: string,
    options?: { remember?: boolean },
  ) => Promise<boolean>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    agreeToTerms: boolean;
  }) => Promise<boolean>;
  logout: () => void;
  setError: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore session on mount
  useEffect(() => {
    const savedToken = getStoredItem("customerToken");
    const savedUser = getStoredItem("currentUser");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCustomer(JSON.parse(savedUser));
    }
    setHydrating(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    options?: { remember?: boolean },
  ): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      const res = await loginCustomer(email, password);
      const { token: t, customer: user } = res.data;
      const area = options?.remember ? "local" : "session";

      setToken(t);
      setCustomer(user);
      setStoredItem("customerToken", t, area);
      setStoredItem("currentUser", JSON.stringify(user), area);
      if (user.role === "admin" || user.isAdmin) {
        setStoredItem("adminToken", t, area);
        setStoredItem("adminUser", JSON.stringify(user), area);
      } else {
        removeStoredItem("adminToken");
        removeStoredItem("adminUser");
      }
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    agreeToTerms: boolean;
  }): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      await registerCustomer({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        phone: data.phoneNumber,
        address: "",
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    removeStoredItem("customerToken");
    removeStoredItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!token,
        hydrating,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
