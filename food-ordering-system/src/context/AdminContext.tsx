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
  getReviews as apiGetReviews,
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

  // Reviews
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

function firstValue(...values: any[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function getOrderId(order: any) {
  return String(
    firstValue(
      order.id,
      order.orderId,
      order.order_id,
      order.order?.id,
      order.order?.order_id,
      "",
    ),
  );
}

function getOrderItems(order: any, items?: any[]) {
  return (
    items ??
    order.items ??
    order.orderItems ??
    order.order_items ??
    order.order_details ??
    order.details ??
    []
  );
}

function getOrderList(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.orders)) return response.orders;
  return [];
}

function getReviewList(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.reviews)) return response.reviews;
  return [];
}

function mapReview(review: any): Review {
  return {
    id: String(firstValue(review.id, review.review_id, crypto.randomUUID())),
    customerId:
      firstValue(review.customerId, review.customer_id) !== undefined
        ? String(firstValue(review.customerId, review.customer_id))
        : undefined,
    customerName:
      firstValue(review.customerName, review.customer_name) ||
      "Anonymous customer",
    foodItemId:
      firstValue(review.foodItemId, review.food_item_id, review.itemId) !==
      undefined
        ? String(firstValue(review.foodItemId, review.food_item_id, review.itemId))
        : undefined,
    foodItemName:
      firstValue(review.foodItemName, review.food_item_name, review.itemName) ||
      "Unknown item",
    orderId: String(firstValue(review.orderId, review.order_id, "")),
    rating: Number(firstValue(review.rating, 0)),
    comment: firstValue(review.comment, review.review, "") || "",
    createdAt:
      firstValue(review.createdAt, review.created_at, review.date) ||
      new Date().toISOString(),
    hidden: Boolean(firstValue(review.hidden, false)),
  };
}

// Helper: map PHP Order to AdminOrder
function mapOrder(order: any, customer?: any, items?: any[]): AdminOrder {
  const baseOrder = order.order ?? order;
  const itemList = getOrderItems(order, items);

  return {
    id: getOrderId(order),
    customerName:
      firstValue(
        order.customerName,
        order.customer_name,
        baseOrder.customerName,
        baseOrder.customer_name,
        order.customer?.name,
        customer?.name,
      ) || "Customer",
    customerEmail:
      firstValue(
        order.customerEmail,
        order.customer_email,
        baseOrder.customerEmail,
        baseOrder.customer_email,
        order.customer?.email,
        customer?.email,
      ) || "",
    customerPhone:
      firstValue(
        order.customerPhone,
        order.customer_phone,
        baseOrder.customerPhone,
        baseOrder.customer_phone,
        order.customer?.phone,
        customer?.phone,
      ) || "",
    customerAddress:
      firstValue(
        order.customerAddress,
        order.customer_address,
        baseOrder.customerAddress,
        baseOrder.customer_address,
        order.customer?.address,
        customer?.address,
      ) || "",
    items: itemList.map(
      (i: any): AdminOrderItem => ({
        id: String(firstValue(i.id, i.menuId, i.menu_id, i.order_item_id, "")),
        name:
          firstValue(
            i.name,
            i.foodName,
            i.food_name,
            i.itemName,
            i.item_name,
            i.menuName,
            i.menu_name,
            i.menu?.name,
            i.menu?.food_name,
          ) || "",
        quantity: Number(firstValue(i.quantity, i.qty, 0)),
        price: Number(firstValue(i.price, i.unitPrice, i.unit_price, 0)),
      }),
    ),
    subtotal: Number(
      firstValue(baseOrder.subtotal, baseOrder.total_amount, baseOrder.total, 0),
    ),
    total: Number(firstValue(baseOrder.total, baseOrder.total_amount, 0)),
    status: firstValue(
      baseOrder.status,
      baseOrder.order_status,
      "Pending",
    ) as OrderStatus,
    createdAt:
      firstValue(baseOrder.createdAt, baseOrder.created_at, baseOrder.order_date) ??
      new Date().toISOString(),
    updatedAt:
      firstValue(
        baseOrder.updatedAt,
        baseOrder.updated_at,
        baseOrder.order_date,
        baseOrder.createdAt,
      ) ?? new Date().toISOString(),
    paymentMethod: firstValue(baseOrder.paymentMethod, baseOrder.payment_method),
    deliveryNotes: firstValue(baseOrder.deliveryNotes, baseOrder.delivery_notes),
  };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const saved = getStoredItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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
      setOrders(getOrderList(data).map((o: any) => mapOrder(o)));
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

  // REVIEWS
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await apiGetReviews();
      setReviews(getReviewList(data).map(mapReview));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
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
