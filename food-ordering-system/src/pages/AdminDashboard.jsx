import React, { useEffect, useState } from "react";
import C from "../constants/colors";
import { getAdminDashboardData } from "../services/adminDashboardApi";

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
      const data = await getAdminDashboardData();

      setAdminProfile(data.adminProfile);
      setOrderStats(data.orderStats);
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
    </div>
  );
}

export default AdminDashboard;