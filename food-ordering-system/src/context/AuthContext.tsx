// src/context/AuthContext.tsx
// Manages customer auth state — token + user stored in localStorage

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginCustomer, registerCustomer } from "../services/api";
import type { Customer } from "../interfaces";

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => void;
  setError: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("customerToken");
    const savedUser = localStorage.getItem("currentUser");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCustomer(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      const res = await loginCustomer(email, password);
      const { token: t, customer: c } = res.data;

      setToken(t);
      setCustomer(c);
      localStorage.setItem("customerToken", t);
      localStorage.setItem("currentUser", JSON.stringify(c));
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
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      await registerCustomer(data);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem("customerToken");
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!token,
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
