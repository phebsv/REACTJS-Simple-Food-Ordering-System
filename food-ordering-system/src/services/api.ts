import axios from "axios";

// ─────────────────────────────────────────────
// BASE CONFIG
// ─────────────────────────────────────────────
const API = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach token automatically
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("customerToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role?: "admin" | "user";
  isAdmin?: boolean;
};

export type AuthResponse = {
  message: string;
  token: string;
  user?: AuthUser;
  admin?: AuthUser;
};

type BackendAuthResponse = {
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<BackendAuthResponse> {
  const res = await API.post("/auth/login", payload);
  return res.data as BackendAuthResponse;
}

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  agreeToTerms: boolean;
}): Promise<BackendAuthResponse> {
  const res = await API.post("/auth/register", {
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    email: payload.email,
    password: payload.password,
    phone: payload.phoneNumber,
    address: "",
  });
  return res.data as BackendAuthResponse;
}

// ─────────────────────────────────────────────
// AUTH (CUSTOMER)
// ─────────────────────────────────────────────
export async function loginCustomer(email: string, password: string) {
  const res = await loginUser({ email, password });
  return { data: { token: res.data.token, customer: res.data.user } };
}

export async function registerCustomer(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) {
  const res = await API.post("/auth/register", {
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone || "",
    address: data.address || "",
  });

  return { data: { token: res.data.data.token, customer: res.data.data.user } };
}

// ─────────────────────────────────────────────
// AUTH (ADMIN) ✅ FIXED
// ─────────────────────────────────────────────
export async function loginAdmin(email: string, password: string) {
  const res = await API.post("/auth/admin-login", {
    username: email, // 🔥 IMPORTANT FIX
    password,
  });

  return {
    data: {
      token: res.data.data.token,
      admin: res.data.data.admin,
    },
  };
}

// ─────────────────────────────────────────────
// MENU (ADMIN)
// ─────────────────────────────────────────────
export async function adminGetMenuItems() {
  const res = await API.get("/menu");
  return res.data;
}

export async function adminAddMenuItem(data: any) {
  const res = await API.post("/menu", data);
  return res.data;
}

export async function adminUpdateMenuItem(id: string, data: any) {
  const res = await API.patch(`/menu/${id}`, data);
  return res.data;
}

export async function adminDeleteMenuItem(id: string) {
  const res = await API.delete(`/menu/${id}`);
  return res.data;
}

// ─────────────────────────────────────────────
// ORDERS (ADMIN)
// ─────────────────────────────────────────────
export async function adminGetOrders() {
  const res = await API.get("/orders");
  return res.data;
}

export async function adminUpdateOrderStatus(id: number, status: string) {
  const res = await API.patch(`/orders/${id}`, {
    status,
  });
  return res.data;
}

// ─────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────
export async function getInventory() {
  const res = await API.get("/inventory");
  return res.data;
}

export async function updateInventory(id: string, data: any) {
  const res = await API.patch(`/inventory/${id}`, data);
  return res.data;
}

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────
export async function getReviews() {
  const res = await API.get("/reviews");
  return res.data;
}

export async function addReview(data: any) {
  const res = await API.post("/reviews", data);
  return res.data;
}

export async function deleteReview(id: string) {
  const res = await API.delete(`/reviews/${id}`);
  return res.data;
}
