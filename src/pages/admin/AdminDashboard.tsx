import { useEffect, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import { useAdmin } from "../../context/AdminContext";
import type { Order } from "../../types";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { orders, menuItems, inventoryItems, fetchOrders, loading, error, setError } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==================== CALCULATIONS ====================
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);

    return {
      totalOrders: todayOrders.length,
      totalRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
      pending: orders.filter((o) => o.status === "Pending").length,
      preparing: orders.filter((o) => o.status === "Preparing").length,
      ready: orders.filter((o) => o.status === "Ready").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
    };
  }, [orders]);

  // ==================== POPULAR ITEMS ====================
  const popularItems = useMemo(() => {
    const itemCounts: Record<string, { name: string; count: number; id: string }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = { name: item.name, count: 0, id: item.id };
        }
        itemCounts[item.id].count += item.quantity;
      });
    });
    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  // ==================== RECENT ORDERS ====================
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  }, [orders]);

  // ==================== LOW STOCK ITEMS ====================
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").slice(0, 5);
  }, [inventoryItems]);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        {/* ==================== HEADER ==================== */}
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p className="admin-subtitle">Welcome back! Here's your business overview.</p>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        {/* ==================== STAT CARDS ==================== */}
        <div className="dashboard-stats">
          <StatCard
            title="Orders Today"
            value={stats.totalOrders}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="Revenue Today"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pending}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Preparing"
            value={stats.preparing}
            icon="👨‍🍳"
            color="orange"
          />
          <StatCard
            title="Ready"
            value={stats.ready}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon="🚚"
            color="blue"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon="❌"
            color="red"
          />
        </div>

        <div className="dashboard-grid">
          {/* ==================== POPULAR ITEMS ==================== */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Popular Items</h2>
              <button className="section-action-btn" onClick={() => navigate("/admin/menu")}>
                Manage Menu →
              </button>
            </div>
            <div className="popular-items-list">
              {popularItems.length === 0 ? (
                <p className="empty-state">No items sold yet</p>
              ) : (
                popularItems.map((item, idx) => (
                  <div key={item.id} className="popular-item">
                    <div className="popular-item-rank">#{idx + 1}</div>
                    <div className="popular-item-info">
                      <div className="popular-item-name">{item.name}</div>
                      <div className="popular-item-count">{item.count} orders</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ==================== LOW STOCK ITEMS ==================== */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Low/Out of Stock</h2>
              <button className="section-action-btn" onClick={() => navigate("/admin/inventory")}>
                Manage Inventory →
              </button>
            </div>
            <div className="low-stock-list">
              {lowStockItems.length === 0 ? (
                <p className="empty-state">All items in stock</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="low-stock-item">
                    <div className="low-stock-info">
                      <div className="low-stock-name">{item.name}</div>
                      <div className="low-stock-status">{item.status}</div>
                    </div>
                    <div className={`stock-badge ${item.status === "Out of Stock" ? "critical" : "warning"}`}>
                      {item.stock} left
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================== RECENT ORDERS ==================== */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>Recent Orders (Last 10)</h2>
            <button className="section-action-btn" onClick={() => navigate("/admin/orders")}>
              View All Orders →
            </button>
          </div>
          <div className="recent-orders-table">
            {recentOrders.length === 0 ? (
              <p className="empty-state">No orders yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id.slice(0, 8)}</td>
                      <td>{order.customerName}</td>
                      <td>{order.items.length} item(s)</td>
                      <td className="order-total">${order.total.toFixed(2)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD COMPONENT ====================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "yellow" | "orange" | "red";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
}

// ==================== STATUS BADGE COMPONENT ====================
function StatusBadge({ status }: { status: string }) {
  const statusClass = {
    Pending: "badge-pending",
    Preparing: "badge-preparing",
    Ready: "badge-ready",
    Delivered: "badge-delivered",
    Cancelled: "badge-cancelled",
  }[status] || "badge-default";

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}
