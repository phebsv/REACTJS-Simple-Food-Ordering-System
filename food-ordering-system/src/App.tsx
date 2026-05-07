// src/App.tsx
// Root app — wraps everything in AuthProvider + AdminProvider
// Drop-in replacement for your existing App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { CartProvider } from "./context/CartContext";

// Customer pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/user/Dashboard";
import Menu from "./pages/user/Menu";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import MyOrders from "./pages/user/MyOrders";
import Profile from "./pages/user/Profile";

// Admin pages (keep your existing ones — they now use the connected AdminContext)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminReviews from "./pages/admin/AdminReviews";

// Protected route helpers
import { useAuth } from "./context/AuthContext";
import { useAdmin } from "./context/AdminContext";
import type { ReactNode } from "react";

function CustomerRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAdmin();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer protected */}
      <Route
        path="/dashboard"
        element={
          <CustomerRoute>
            <Dashboard />
          </CustomerRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <CustomerRoute>
            <Menu />
          </CustomerRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerRoute>
            <Cart />
          </CustomerRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <CustomerRoute>
            <Checkout />
          </CustomerRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <CustomerRoute>
            <MyOrders />
          </CustomerRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <CustomerRoute>
            <Profile />
          </CustomerRoute>
        }
      />

      {/* Admin protected */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <AdminRoute>
            <AdminMenu />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminRoute>
            <AdminInventory />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AdminRoute>
            <AdminReviews />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
