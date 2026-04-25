import React, { useState } from "react";
import C from "../constants/colors";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import OrderSummaryCards from "../components/admin/OrderSummaryCards";
import OrdersOverviewChart from "../components/admin/OrdersOverviewChart";
import OrdersTable from "../components/admin/OrdersTable";

function AdminDashboard() {

  const adminProfile = {
  name: "JASON CONOPIO",
  role: "Admin",
};

const orderStats = [
  {
    label: "TOTAL ORDERS",
    value: 5,
    icon: "🛍️",
  },
  {
    label: "ON PROCESS",
    value: 3,
    icon: "⟳",
  },
  {
    label: "COMPLETED",
    value: 2,
    icon: "✓",
  },
  {
    label: "CANCELED",
    value: 0,
    icon: "×",
  },
];

const orders = [
  {
    orderId: "ord100",
    date: "2026-7-22",
    customerName: "jason conopio",
    address: "tabunoc, talisay city",
    quantity: 1,
    amount: 500,
    status: "completed",
  },
  {
    orderId: "ord101",
    date: "2026-10-5",
    customerName: "ryan cruz",
    address: "minglanilla",
    quantity: 3,
    amount: 750,
    status: "on process",
  },
  {
    orderId: "ord102",
    date: "2026-8-20",
    customerName: "jane yu",
    address: "naga",
    quantity: 6,
    amount: 1500,
    status: "canceled",
  },
];

const [activeStatus, setActiveStatus] = useState("all");
const [searchTerm, setSearchTerm] = useState("");

const orderTabs = ["all", "on process", "completed", "canceled"];

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

        {/* Cards and Chart */}
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
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;