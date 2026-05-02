// src/services/axios.ts
// Central Axios instance — all API calls go through here

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/food-ordering", // PHP backend base URL (XAMPP)
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — attach token automatically ──────────────────────────
api.interceptors.request.use((config) => {
  // Check for customer token first, then admin token
  const customerToken = localStorage.getItem("customerToken");
  const adminToken = localStorage.getItem("adminToken");
  const token = customerToken || adminToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor — handle 401/403 globally ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem("customerToken");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
