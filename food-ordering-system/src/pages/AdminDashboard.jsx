<<<<<<< HEAD
import React from "react";

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>This is the admin dashboard page.</p>
=======
import React, { useEffect, useState } from "react";
import C from "../constants/colors";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import OrderSummaryCards from "../components/admin/OrderSummaryCards";
import OrdersOverviewChart from "../components/admin/OrdersOverviewChart";
import OrdersTable from "../components/admin/OrdersTable";

function AdminDashboard() {
  const [adminProfile, setAdminProfile] = useState({
    name: "",
    role: "",
  });

const [orderStats, setOrderStats] = useState([]);
const [orders, setOrders] = useState([]);

const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminDashboardData = async () => {
      try {
        const [profileResponse, statsResponse, ordersResponse] =
          await Promise.all([
            fetch("http://localhost:4001/adminProfile"),
            fetch("http://localhost:4001/orderStats"),
            fetch("http://localhost:4001/orders"),
          ]);

        const profileData = await profileResponse.json();
        const statsData = await statsResponse.json();
        const ordersData = await ordersResponse.json();

        setAdminProfile(profileData);
        setOrderStats(statsData);
        setOrders(ordersData);
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.cream,
        fontFamily: "Arial, sans-serif",
      }}
    >
    <div
       style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        backgroundColor: C.cream,
        overflow: "hidden",
     }}
    >
       <AdminSidebar />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: "26px 34px",
            overflowX: "auto",
          }}
        >
          <AdminHeader
            adminProfile={adminProfile}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        {isLoading ? (
            <section
              style={{
                backgroundColor: C.white,
                borderRadius: "14px",
                padding: "30px",
                fontWeight: "800",
                color: C.text,
              }}
            >
              Loading admin dashboard...
            </section>
          ) : (
            <>
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

         <OrdersTable
            orders={filteredOrders}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
          />
          </>
          )}
        </main>
      </div>
>>>>>>> 02d1a69 (chore: move admin sample data to db json)
    </div>
  );
}

export default AdminDashboard;