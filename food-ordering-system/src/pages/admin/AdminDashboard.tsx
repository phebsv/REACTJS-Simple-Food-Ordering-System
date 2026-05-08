import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import { useAdmin } from "../../context/AdminContext";
import type { AdminProfile } from "../../interfaces";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { orders, inventoryItems, fetchOrders, loading, error } = useAdmin();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const adminProfile: AdminProfile = {
    name: "Admin",
    role: "Administrator",
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const ordersList = orders as any[];

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    const todayOrders = ordersList.filter((order) => {
      const orderDate = order.createdAt || order.date;
      if (!orderDate) return false;

      return new Date(orderDate).toDateString() === today;
    });

    const getStatusCount = (targetStatus: string) => {
      return ordersList.filter(
        (order) =>
          String(order.status || "").toLowerCase() ===
          targetStatus.toLowerCase()
      ).length;
    };

    return {
      totalOrders: todayOrders.length,
      totalRevenue: todayOrders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      ),
      pending: getStatusCount("Pending"),
      preparing: getStatusCount("Preparing"),
      ready: getStatusCount("Ready"),
      delivered: getStatusCount("Delivered"),
      cancelled:
        getStatusCount("Cancelled") + getStatusCount("Canceled"),
    };
  }, [ordersList]);

  const popularItems = useMemo(() => {
    const itemCounts: Record<string, { name: string; count: number; id: string }> =
      {};

    ordersList.forEach((order) => {
      const items = order.items || [];

      items.forEach((item: any) => {
        const itemId = item.id || item.name;

        if (!itemCounts[itemId]) {
          itemCounts[itemId] = {
            name: item.name,
            count: 0,
            id: itemId,
          };
        }

        itemCounts[itemId].count += Number(item.quantity || 1);
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [ordersList]);

  const lowStockItems = useMemo(() => {
    return inventoryItems
      .filter(
        (item: any) =>
          item.status === "Low Stock" || item.status === "Out of Stock"
      )
      .slice(0, 5);
  }, [inventoryItems]);

  const recentOrders = useMemo(() => {
    const searchValue = searchTerm.toLowerCase();

    return [...ordersList]
      .filter((order) => {
        const orderId = String(order.id || order.orderId || "").toLowerCase();
        const customerName = String(order.customerName || "").toLowerCase();
        const status = String(order.status || "").toLowerCase();
        const date = String(order.createdAt || order.date || "").toLowerCase();

        return (
          orderId.includes(searchValue) ||
          customerName.includes(searchValue) ||
          status.includes(searchValue) ||
          date.includes(searchValue)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 10);
  }, [ordersList, searchTerm]);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-content">
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <AdminHeader
          title="Dashboard"
          subtitle="Overview and recent order activity"
          adminProfile={adminProfile}
          searchTerm={searchTerm}
          searchPlaceholder="Search recent orders..."
          onSearchChange={setSearchTerm}
        />

        {error && <div className="admin-error-banner">{error}</div>}

        {/* HIS CLEANER SUMMARY CARDS */}
        <div className="dashboard-stats">
          <StatCard
            title="Orders Today"
            value={stats.totalOrders}
            icon="Orders"
            color="blue"
          />

          <StatCard
            title="Revenue Today"
            value={`₱${stats.totalRevenue.toFixed(2)}`}
            icon="Revenue"
            color="green"
          />

          <StatCard
            title="Pending Orders"
            value={stats.pending}
            icon="Pending"
            color="yellow"
          />

          <StatCard
            title="Preparing"
            value={stats.preparing}
            icon="Preparing"
            color="orange"
          />

          <StatCard
            title="Ready"
            value={stats.ready}
            icon="Ready"
            color="green"
          />

          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon="Delivered"
            color="blue"
          />

          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon="Cancelled"
            color="red"
          />
        </div>

        <div className="dashboard-grid">
          {/* POPULAR ITEMS */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Popular Items</h2>

              <button
                className="section-action-btn"
                onClick={() => navigate("/admin/menu")}
              >
                Manage Menu
              </button>
            </div>

            <div className="popular-items-list">
              {popularItems.length === 0 ? (
                <p className="empty-state">No items sold yet</p>
              ) : (
                popularItems.map((item, index) => (
                  <div key={item.id} className="popular-item">
                    <div className="popular-item-rank">#{index + 1}</div>

                    <div className="popular-item-info">
                      <div className="popular-item-name">{item.name}</div>
                      <div className="popular-item-count">
                        {item.count} order(s)
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LOW STOCK */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Low/Out of Stock</h2>

              <button
                className="section-action-btn"
                onClick={() => navigate("/admin/inventory")}
              >
                Manage Inventory
              </button>
            </div>

            <div className="low-stock-list">
              {lowStockItems.length === 0 ? (
                <p className="empty-state">All items in stock</p>
              ) : (
                lowStockItems.map((item: any) => (
                  <div key={item.id} className="low-stock-item">
                    <div className="low-stock-info">
                      <div className="low-stock-name">{item.name}</div>
                      <div className="low-stock-status">{item.status}</div>
                    </div>

                    <div
                      className={`stock-badge ${
                        item.status === "Out of Stock" ? "critical" : "warning"
                      }`}
                    >
                      {item.stock} left
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RECENT ORDERS ONLY, NO OLD ORDERS TABLE */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>Recent Orders</h2>

            <button
              className="section-action-btn"
              onClick={() => navigate("/admin/orders")}
            >
              View All Orders
            </button>
          </div>

          <div className="recent-orders-table">
            {recentOrders.length === 0 ? (
              <p className="empty-state">No orders found</p>
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
                    <tr key={order.id || order.orderId}>
                      <td className="order-id">
                        #{String(order.id || order.orderId || "").slice(0, 8)}
                      </td>

                      <td>{order.customerName}</td>

                      <td>{order.items ? order.items.length : 0} item(s)</td>

                      <td className="order-total">
                        PHP {Number(order.total || 0).toFixed(2)}
                      </td>

                      <td>
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

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

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = String(status || "").toLowerCase();

  const statusClass =
    {
      pending: "badge-pending",
      preparing: "badge-preparing",
      ready: "badge-ready",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
      canceled: "badge-cancelled",
    }[normalizedStatus] || "badge-default";

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}

export default AdminDashboard;
