// src/services/api.ts
// All PHP backend API calls — matches your PHP routes exactly

import api from "./axios";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const registerCustomer = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) => {
  const res = await api.post("/auth/register.php", data);
  return res.data;
};

export const loginCustomer = async (email: string, password: string) => {
  const res = await api.post("/auth/login.php", { email, password });
  return res.data; // { message, data: { token, customer } }
};

export const loginAdmin = async (email: string, password: string) => {
  const res = await api.post("/auth/admin_login.php", { email, password });
  return res.data; // { message, data: { token, admin } }
};

// Kept for Register.tsx compatibility (findUserByEmail)
export const findUserByEmail = async (email: string): Promise<boolean> => {
  try {
    // We can't query by email directly, so attempt login with a dummy password
    // and check if the error says "invalid email" vs "invalid password"
    // Instead, just try to register and catch duplicate email error
    return false; // Handled server-side — register.php returns error if duplicate
  } catch {
    return false;
  }
};

// Kept for Register.tsx compatibility (createUser)
export const createUser = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const res = await api.post("/auth/register.php", { ...data, address: "" });
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// MENU (public — no token needed)
// ─────────────────────────────────────────────────────────────────────────────

export const getMenuItems = async (category?: string) => {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await api.get(`/api/menu.php${params}`);
  return res.data.data; // array of menu items
};

export const getMenuItem = async (id: number) => {
  const res = await api.get(`/api/menu.php?id=${id}`);
  return res.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CART (requires customer token)
// ─────────────────────────────────────────────────────────────────────────────

export const getCart = async () => {
  const res = await api.get("/api/cart.php");
  return res.data.data; // { items, total }
};

export const addToCart = async (menu_id: number, quantity: number = 1) => {
  const res = await api.post("/api/cart.php", { menu_id, quantity });
  return res.data;
};

export const updateCartItem = async (cart_item_id: number, quantity: number) => {
  const res = await api.put("/api/cart.php", { cart_item_id, quantity });
  return res.data;
};

export const removeCartItem = async (cart_item_id: number) => {
  const res = await api.delete(`/api/cart.php?item_id=${cart_item_id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS (requires customer token)
// ─────────────────────────────────────────────────────────────────────────────

export const placeOrder = async () => {
  const res = await api.post("/api/orders.php");
  return res.data;
};

export const getMyOrders = async () => {
  const res = await api.get("/api/orders.php");
  return res.data.data;
};

export const getMyOrder = async (order_id: number) => {
  const res = await api.get(`/api/orders.php?id=${order_id}`);
  return res.data.data; // { order, items }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — MENU (requires admin token)
// ─────────────────────────────────────────────────────────────────────────────

export const adminGetMenuItems = async () => {
  const res = await api.get("/admin/menu.php");
  return res.data.data;
};

export const adminAddMenuItem = async (data: {
  food_name: string;
  description?: string;
  price: number;
  category: string;
  availability_status?: boolean;
}) => {
  const res = await api.post("/admin/menu.php", data);
  return res.data;
};

export const adminUpdateMenuItem = async (
  menu_id: number,
  data: Partial<{
    food_name: string;
    description: string;
    price: number;
    category: string;
    availability_status: boolean;
  }>
) => {
  const res = await api.put("/admin/menu.php", { menu_id, ...data });
  return res.data;
};

export const adminDeleteMenuItem = async (menu_id: number) => {
  const res = await api.delete(`/admin/menu.php?id=${menu_id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — ORDERS (requires admin token)
// ─────────────────────────────────────────────────────────────────────────────

export const adminGetOrders = async () => {
  const res = await api.get("/admin/orders.php");
  return res.data.data;
};

export const adminGetOrder = async (order_id: number) => {
  const res = await api.get(`/admin/orders.php?id=${order_id}`);
  return res.data.data; // { order, customer, items }
};

export const adminUpdateOrderStatus = async (
  order_id: number,
  order_status: "Pending" | "Preparing" | "Ready" | "Delivered"
) => {
  const res = await api.put("/admin/orders.php", { order_id, order_status });
  return res.data;
};
