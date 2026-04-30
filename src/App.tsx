import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminReviews from "./pages/admin/AdminReviews";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

export default function App() {
  return (
    <CartProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            {/* ==================== CUSTOMER ROUTES ==================== */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />

            {/* ==================== ADMIN ROUTES ==================== */}

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedAdminRoute>
                  <AdminOrders />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedAdminRoute>
                  <AdminMenu />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedAdminRoute>
                  <AdminInventory />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedAdminRoute>
                  <AdminReviews />
                </ProtectedAdminRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </CartProvider>
  );
}
