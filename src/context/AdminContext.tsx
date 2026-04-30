import { createContext, useContext, useMemo, useState, type ReactNode, useCallback } from "react";
import type { Order, FoodItem, InventoryItem, Review, AdminUser } from "../types";

type AdminContextType = {
  // Auth
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Orders
  orders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;

  // Menu
  menuItems: FoodItem[];
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (item: Omit<FoodItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, item: Partial<FoodItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;

  // Inventory
  inventoryItems: InventoryItem[];
  fetchInventory: () => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  updateInventoryStatus: (id: string, status: string) => Promise<void>;

  // Reviews
  reviews: Review[];
  fetchReviews: () => Promise<void>;
  hideReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Loading and errors
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE = "http://localhost:4001";

  // ==================== AUTH ====================
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/admins?username=${encodeURIComponent(username)}`);
      if (!r.ok) throw new Error("Authentication failed");
      const admins: AdminUser[] = await r.json();
      const admin = admins.find((a) => a.password === password);
      if (!admin) {
        setError("Invalid credentials");
        return false;
      }
      setAdminUser(admin);
      localStorage.setItem("adminUser", JSON.stringify(admin));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAdminUser(null);
    localStorage.removeItem("adminUser");
  }, []);

  // ==================== ORDERS ====================
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/orders`);
      if (!r.ok) throw new Error("Failed to fetch orders");
      const data = await r.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to update order");
      const updated = await r.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", updatedAt: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to cancel order");
      const updated = await r.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== MENU ====================
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/menu`);
      if (!r.ok) throw new Error("Failed to fetch menu");
      const data = await r.json();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  }, []);

  const addMenuItem = useCallback(async (item: Omit<FoodItem, "id">) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, id: Date.now().toString() }),
      });
      if (!r.ok) throw new Error("Failed to add menu item");
      const newItem = await r.json();
      setMenuItems((prev) => [...prev, newItem]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add menu item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (id: string, item: Partial<FoodItem>) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!r.ok) throw new Error("Failed to update menu item");
      const updated = await r.json();
      setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update menu item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/menu/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete menu item");
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete menu item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleItemAvailability = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const item = menuItems.find((m) => m.id === id);
      if (!item) throw new Error("Item not found");
      const r = await fetch(`${BASE}/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      if (!r.ok) throw new Error("Failed to toggle availability");
      const updated = await r.json();
      setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle availability");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuItems]);

  // ==================== INVENTORY ====================
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/inventory`);
      if (!r.ok) throw new Error("Failed to fetch inventory");
      const data = await r.json();
      setInventoryItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStock = useCallback(async (id: string, quantity: number) => {
    try {
      setLoading(true);
      const status = quantity === 0 ? "Out of Stock" : quantity < 10 ? "Low Stock" : "Available";
      const r = await fetch(`${BASE}/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: quantity, status, lastUpdated: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to update stock");
      const updated = await r.json();
      setInventoryItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInventoryStatus = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, lastUpdated: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to update inventory status");
      const updated = await r.json();
      setInventoryItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inventory status");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== REVIEWS ====================
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/reviews`);
      if (!r.ok) throw new Error("Failed to fetch reviews");
      const data = await r.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  const hideReview = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: true }),
      });
      if (!r.ok) throw new Error("Failed to hide review");
      const updated = await r.json();
      setReviews((prev) => prev.map((rv) => (rv.id === id ? updated : rv)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hide review");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/reviews/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete review");
      setReviews((prev) => prev.filter((rv) => rv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      adminUser,
      isAuthenticated: !!adminUser,
      login,
      logout,
      orders,
      fetchOrders,
      updateOrderStatus,
      cancelOrder,
      menuItems,
      fetchMenuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleItemAvailability,
      inventoryItems,
      fetchInventory,
      updateStock,
      updateInventoryStatus,
      reviews,
      fetchReviews,
      hideReview,
      deleteReview,
      loading,
      error,
      setError,
    }),
    [
      adminUser,
      login,
      logout,
      orders,
      fetchOrders,
      updateOrderStatus,
      cancelOrder,
      menuItems,
      fetchMenuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleItemAvailability,
      inventoryItems,
      fetchInventory,
      updateStock,
      updateInventoryStatus,
      reviews,
      fetchReviews,
      hideReview,
      deleteReview,
      loading,
      error,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
