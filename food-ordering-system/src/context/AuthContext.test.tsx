import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock the API
vi.mock("../services/api", () => ({
  loginCustomer: vi.fn(),
  registerCustomer: vi.fn(),
}));

vi.mock("../utils/storage", () => ({
  getStoredItem: vi.fn(() => null),
  setStoredItem: vi.fn(),
  removeStoredItem: vi.fn(),
}));

import { loginCustomer, registerCustomer } from "../services/api";
import { getStoredItem, setStoredItem, removeStoredItem } from "../utils/storage";

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getStoredItem as any).mockReturnValue(null);
  });

  it("initializes with null user and token", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.customer).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("handles successful login", async () => {
    const mockUser = { id: "1", email: "user@example.com", role: "user" };
    const mockToken = "mock-token";

    (loginCustomer as any).mockResolvedValue({
      data: { token: mockToken, customer: mockUser },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      const success = await result.current.login("user@example.com", "Password123");
      expect(success).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.customer).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(setStoredItem).toHaveBeenCalledWith("customerToken", mockToken, "session");
    expect(setStoredItem).toHaveBeenCalledWith("currentUser", JSON.stringify(mockUser), "session");
  });

  it("handles failed login", async () => {
    (loginCustomer as any).mockRejectedValue(
      new Error("Invalid credentials")
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      const success = await result.current.login("user@example.com", "WrongPassword");
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.customer).toBeNull();
  });

  it("handles remember me option", async () => {
    const mockUser = { id: "1", email: "user@example.com", role: "user" };
    const mockToken = "mock-token";

    (loginCustomer as any).mockResolvedValue({
      data: { token: mockToken, customer: mockUser },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login("user@example.com", "Password123", { remember: true });
    });

    expect(setStoredItem).toHaveBeenCalledWith("customerToken", mockToken, "local");
  });

  it("handles successful registration", async () => {
    (registerCustomer as any).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      const success = await result.current.register({
        firstName: "Juan",
        lastName: "Dela Cruz",
        email: "juan@example.com",
        password: "Password123",
        phoneNumber: "09171234567",
        agreeToTerms: true,
      });
      expect(success).toBe(true);
    });
  });

  it("handles failed registration", async () => {
    (registerCustomer as any).mockRejectedValue(
      new Error("Email already exists")
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      const success = await result.current.register({
        firstName: "Juan",
        lastName: "Dela Cruz",
        email: "juan@example.com",
        password: "Password123",
        phoneNumber: "09171234567",
        agreeToTerms: true,
      });
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it("handles logout", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.customer).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(removeStoredItem).toHaveBeenCalledWith("customerToken");
    expect(removeStoredItem).toHaveBeenCalledWith("currentUser");
  });

  it("sets error message", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.setError("Custom error message");
    });

    expect(result.current.error).toBe("Custom error message");
  });
});
