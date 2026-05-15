import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { getStoredItem, setStoredItem, removeStoredItem } from "../utils/storage";

describe("Storage Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("setStoredItem", () => {
    it("stores item in localStorage by default", () => {
      setStoredItem("key", "value");
      expect(localStorage.getItem("key")).toBe("value");
    });

    it("stores item in sessionStorage when specified", () => {
      setStoredItem("key", "value", "session");
      expect(sessionStorage.getItem("key")).toBe("value");
    });

    it("stores item in localStorage when 'local' is specified", () => {
      setStoredItem("key", "value", "local");
      expect(localStorage.getItem("key")).toBe("value");
    });

    it("stores complex data as JSON", () => {
      const data = { name: "Juan", age: 25 };
      setStoredItem("user", JSON.stringify(data), "local");
      const retrieved = JSON.parse(localStorage.getItem("user") || "");
      expect(retrieved).toEqual(data);
    });

    it("overwrites existing values", () => {
      setStoredItem("key", "value1");
      setStoredItem("key", "value2");
      expect(localStorage.getItem("key")).toBe("value2");
    });
  });

  describe("getStoredItem", () => {
    it("retrieves item from localStorage by default", () => {
      localStorage.setItem("key", "value");
      const result = getStoredItem("key");
      expect(result).toBe("value");
    });

    it("retrieves item from sessionStorage when specified", () => {
      sessionStorage.setItem("key", "value");
      const result = getStoredItem("key", "session");
      expect(result).toBe("value");
    });

    it("returns null for non-existent keys", () => {
      const result = getStoredItem("nonexistent");
      expect(result).toBeNull();
    });

    it("checks localStorage first by default", () => {
      localStorage.setItem("key", "local-value");
      sessionStorage.setItem("key", "session-value");
      const result = getStoredItem("key");
      expect(result).toBe("local-value");
    });

    it("handles JSON data", () => {
      const data = { name: "Juan", age: 25 };
      localStorage.setItem("user", JSON.stringify(data));
      const result = getStoredItem("user");
      const parsed = JSON.parse(result || "");
      expect(parsed).toEqual(data);
    });
  });

  describe("removeStoredItem", () => {
    it("removes item from localStorage by default", () => {
      localStorage.setItem("key", "value");
      removeStoredItem("key");
      expect(localStorage.getItem("key")).toBeNull();
    });

    it("removes item from sessionStorage when specified", () => {
      sessionStorage.setItem("key", "value");
      removeStoredItem("key", "session");
      expect(sessionStorage.getItem("key")).toBeNull();
    });

    it("removes item from localStorage when 'local' is specified", () => {
      localStorage.setItem("key", "value");
      removeStoredItem("key", "local");
      expect(localStorage.getItem("key")).toBeNull();
    });

    it("does nothing if key doesn't exist", () => {
      expect(() => removeStoredItem("nonexistent")).not.toThrow();
    });

    it("only removes specified storage, not both", () => {
      localStorage.setItem("key", "local-value");
      sessionStorage.setItem("key", "session-value");
      removeStoredItem("key", "local");
      expect(localStorage.getItem("key")).toBeNull();
      expect(sessionStorage.getItem("key")).toBe("session-value");
    });
  });

  describe("Storage Integration", () => {
    it("can store and retrieve multiple items", () => {
      setStoredItem("user", "Juan", "local");
      setStoredItem("token", "abc123", "local");
      setStoredItem("sessionId", "xyz789", "session");

      expect(getStoredItem("user", "local")).toBe("Juan");
      expect(getStoredItem("token", "local")).toBe("abc123");
      expect(getStoredItem("sessionId", "session")).toBe("xyz789");
    });

    it("maintains separate localStorage and sessionStorage", () => {
      setStoredItem("key", "local-value", "local");
      setStoredItem("key", "session-value", "session");

      expect(getStoredItem("key", "local")).toBe("local-value");
      expect(getStoredItem("key", "session")).toBe("session-value");
    });

    it("clear storage works correctly", () => {
      setStoredItem("key1", "value1", "local");
      setStoredItem("key2", "value2", "session");

      localStorage.clear();
      expect(getStoredItem("key1", "local")).toBeNull();
      expect(getStoredItem("key2", "session")).toBe("value2");
    });
  });
});
