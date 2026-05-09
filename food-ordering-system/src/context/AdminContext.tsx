// src/context/AdminContext.tsx
// Manages admin auth state + menu items, orders, inventory, reviews

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import {
  loginAdmin,
  adminGetMenuItems,
  adminAddMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
  adminGetOrders,
  adminUpdateOrderStatus,
} from "../services/api.ts";
import {
  getStoredItem,
  removeStoredItem,
  setStoredItem,
} from "../utils/storage";
import type {
  Admin,
  FoodItem,
  AdminOrder,
  AdminOrderItem,
  InventoryItem,
  Review,
  OrderStatus,
} from "../interfaces";

interface AdminContextType {
  // Auth
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Menu
  menuItems: FoodItem[];
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (data: Omit<FoodItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, data: Partial<FoodItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;

  // Orders
  orders: AdminOrder[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;

  // Inventory (derived from menu items)
  inventoryItems: InventoryItem[];
  fetchInventory: () => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  updateInventoryStatus: (id: string, status: string) => Promise<void>;

  // Reviews (mock - not in PHP backend)
  reviews: Review[];
  fetchReviews: () => Promise<void>;
  hideReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // State
  loading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Helper: map PHP MenuItem to FoodItem
function mapMenuItem(item: any): FoodItem {
  return {
    id: String(item.id ?? item.menu_id),
    name: item.name ?? item.food_name ?? "",
    category: item.category ?? "",
    price: Number(item.price),
    description: item.description || "",
    image: item.image ?? item.image_url ?? "",
    available: item.available ?? Boolean(item.availability_status),
    stock: item.stock ?? undefined,
  };
}

// Helper: map PHP Order to AdminOrder
function mapOrder(order: any, customer?: any, items?: any[]): AdminOrder {
  const itemList = items ?? order.items ?? [];

  return {
    id: String(order.id ?? order.order_id),
    customerName:
      order.customerName || order.customer_name || customer?.name || "Customer",
    customerEmail: order.customerEmail || customer?.email || "",
    customerPhone: order.customerPhone || customer?.phone || "",
    customerAddress: order.customerAddress || customer?.address || "",
    items: itemList.map(
      (i: any): AdminOrderItem => ({
        id: String(i.id ?? i.order_item_id),
        name: i.name ?? i.food_name ?? "",
        quantity: Number(i.quantity ?? 0),
        price: Number(i.price ?? 0),
      }),
    ),
    subtotal: Number(order.subtotal ?? order.total_amount ?? order.total ?? 0),
    total: Number(order.total ?? order.total_amount ?? 0),
    status: (order.status ?? order.order_status) as OrderStatus,
    createdAt: order.createdAt ?? order.order_date ?? new Date().toISOString(),
    updatedAt: order.updatedAt ?? order.order_date ?? new Date().toISOString(),
    paymentMethod: order.paymentMethod ?? order.payment_method,
    deliveryNotes: order.deliveryNotes ?? order.delivery_notes,
  };
}

// Mock reviews (no reviews table in PHP backend)
const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    customerName: "Maria Santos",
    foodItemName: "Chicken Adobo",
    orderId: "1",
    rating: 5,
    comment: "Absolutely delicious! Just like home cooking.",
    createdAt: new Date().toISOString(),
    hidden: false,
  },
  {
    id: "2",
    customerName: "Jose Reyes",
    foodItemName: "Pork Sinigang",
    orderId: "2",
    rating: 4,
    comment: "Great flavor, the sourness was perfect.",
    createdAt: new Date().toISOString(),
    hidden: false,
  },
];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const saved = getStoredItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AUTH
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginAdmin(email, password);
      const { token, admin: a } = res.data;
      setAdmin(a);
      setStoredItem("adminToken", token, "session");
      setStoredItem("adminUser", JSON.stringify(a), "session");
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid admin credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    removeStoredItem("adminToken");
    removeStoredItem("adminUser");
  };

  // MENU
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const data = await adminGetMenuItems();
      setMenuItems(data.map(mapMenuItem));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch menu items.");
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (data: Omit<FoodItem, "id">) => {
    await adminAddMenuItem({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      available: data.available,
      stock: data.stock ?? 0,
    });
    await fetchMenuItems();
  };

  const updateMenuItem = async (id: string, data: Partial<FoodItem>) => {
    await adminUpdateMenuItem(id, {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      available: data.available,
      stock: data.stock,
    });
    await fetchMenuItems();
  };

  const deleteMenuItem = async (id: string) => {
    await adminDeleteMenuItem(id);
    await fetchMenuItems();
  };

  const toggleItemAvailability = async (id: string) => {
    const item = menuItems.find((i) => i.id === id);
    if (!item) return;
    await adminUpdateMenuItem(id, {
      available: !item.available,
    });
    await fetchMenuItems();
  };

  // ORDERS
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminGetOrders();
      setOrders(data.map((o: any) => mapOrder(o)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await adminUpdateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const cancelOrder = async (id: string) => {
    // PHP backend doesn't have cancel endpoint - update locally
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Cancelled" as any } : o)),
    );
  };

  // INVENTORY (derived from menu items)
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await adminGetMenuItems();
      const mapped: InventoryItem[] = data.map((item: any) => ({
        id: String(item.id ?? item.menu_id),
        name: item.name ?? item.food_name ?? "",
        category: item.category,
        stock: item.stock ?? 100,
        status:
          (item.available ?? item.availability_status)
            ? "Available"
            : "Unavailable",
        lastUpdated: new Date().toISOString(),
      }));
      setInventoryItems(mapped);
    } catch (err: any) {
      setError("Failed to fetch inventory.");
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: quantity,
              status:
                quantity === 0
                  ? "Out of Stock"
                  : quantity < 10
                    ? "Low Stock"
                    : "Available",
              lastUpdated: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const updateInventoryStatus = async (id: string, status: string) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: status as InventoryItem["status"],
              lastUpdated: new Date().toISOString(),
            }
          : item,
      ),
    );
    // Sync availability_status back to PHP
    await adminUpdateMenuItem(id, {
      available: status === "Available",
    });
  };

  // REVIEWS (mock only)
  const fetchReviews = async () => {
    // No reviews endpoint in PHP - use mock data
    setReviews(MOCK_REVIEWS);
  };

  const hideReview = async (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hidden: true } : r)),
    );
  };

  const deleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout,
        menuItems,
        fetchMenuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        orders,
        fetchOrders,
        updateOrderStatus,
        cancelOrder,
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
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
