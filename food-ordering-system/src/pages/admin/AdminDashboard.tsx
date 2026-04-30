import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../../constants/colors";
import { getAdminDashboardData } from "../../services/adminDashboardApi";
import { getOrderStats } from "../../utils/adminDashboardHelpers";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import OrderSummaryCards from "../../components/admin/OrderSummaryCards";
import OrdersOverviewChart from "../../components/admin/OrdersOverviewChart";
import OrdersTable from "../../components/admin/OrdersTable";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import type { AdminProfile, Order } from "../../interfaces";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: "",
    role: "",
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAdminDashboardData = async () => {
      try {
        const data = await getAdminDashboardData();
        setAdminProfile(data.adminProfile);
        setOrders(data.orders);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminDashboardData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeStatus === "all" || order.status === activeStatus;

    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      order.orderId.toLowerCase().includes(searchValue) ||
      order.date.toLowerCase().includes(searchValue) ||
      order.customerName.toLowerCase().includes(searchValue) ||
      order.address.toLowerCase().includes(searchValue) ||
      order.status.toLowerCase().includes(searchValue);

    return matchesStatus && matchesSearch;
  });

  const orderStats = getOrderStats(orders);

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 10);
  }, [orders]);

  const popularCustomers = useMemo(() => {
    const customerCounts: Record<string, number> = {};

    orders.forEach((order) => {
      customerCounts[order.customerName] =
        (customerCounts[order.customerName] || 0) + 1;
    });

    return Object.entries(customerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  return (
    <div
      className="admin-layout"
      style={{
        minHeight: "100vh",
        backgroundColor: C.cream,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <AdminSidebar />

      <main className="admin-content">
        <AdminHeader
          adminProfile={adminProfile}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner />
            <p style={{ fontWeight: 800, color: C.text as string }}>
              Loading admin dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* YOUR OVERVIEW STATISTICS */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "320px 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <OrderSummaryCards orderStats={orderStats} />
              <OrdersOverviewChart />
            </section>

            {/* TEAMMATE-STYLE DASHBOARD LAYOUT */}
            <div className="dashboard-grid">
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Top Customers</h2>
                  <button
                    className="section-action-btn"
                    onClick={() => navigate("/admin/orders")}
                  >
                    View Orders →
                  </button>
                </div>

                <div className="popular-items-list">
                  {popularCustomers.length === 0 ? (
                    <p className="empty-state">No customer data yet</p>
                  ) : (
                    popularCustomers.map((customer, index) => (
                      <div key={customer.name} className="popular-item">
                        <div className="popular-item-rank">#{index + 1}</div>
                        <div className="popular-item-info">
                          <div className="popular-item-name">
                            {customer.name}
                          </div>
                          <div className="popular-item-count">
                            {customer.count} order(s)
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Quick Actions</h2>
                </div>

                <div className="low-stock-list">
                  <button
                    className="section-action-btn"
                    onClick={() => navigate("/admin/orders")}
                  >
                    Manage Orders →
                  </button>

                  <button
                    className="section-action-btn"
                    onClick={() => navigate("/admin/menu")}
                  >
                    Manage Menu →
                  </button>

                  <button
                    className="section-action-btn"
                    onClick={() => navigate("/admin/inventory")}
                  >
                    Manage Inventory →
                  </button>

                  <button
                    className="section-action-btn"
                    onClick={() => navigate("/admin/reviews")}
                  >
                    Manage Reviews →
                  </button>
                </div>
              </div>
            </div>

            {/* YOUR SEARCH + FILTERED ORDERS TABLE */}
            <OrdersTable
              orders={filteredOrders}
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
            />

            {/* TEAMMATE-STYLE RECENT ORDERS SECTION */}
            <div className="dashboard-section full-width">
              <div className="section-header">
                <h2>Recent Orders</h2>
                <button
                  className="section-action-btn"
                  onClick={() => navigate("/admin/orders")}
                >
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
                        <th>Address</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.orderId}>
                          <td className="order-id">#{order.orderId}</td>
                          <td>{order.customerName}</td>
                          <td>{order.address}</td>
                          <td>
                            <span className="status-badge badge-default">
                              {order.status}
                            </span>
                          </td>
                          <td className="order-date">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;