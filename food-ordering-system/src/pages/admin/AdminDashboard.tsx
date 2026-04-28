import { useEffect, useState } from "react";
import C from "../constants/colors";
import { getAdminDashboardData } from "../../services/adminDashboardApi";
import { getOrderStats } from "../../utils/adminDashboardHelpers";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import OrderSummaryCards from "../../components/admin/OrderSummaryCards";
import OrdersOverviewChart from "../../components/admin/OrdersOverviewChart";
import OrdersTable from "../../components/admin/OrdersTable";

// 1. Define the shape of a single Order
interface Order {
  orderId: string;
  date: string;
  customerName: string;
  address: string;
  quantity: number;
  amount: number;
  status: string;
}

// 2. Define the Admin Profile shape
interface AdminProfile {
  name: string;
  role: string;
}

function AdminDashboard() {
  // 3. Apply types to your useState hooks
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
        // Assuming your API returns { adminProfile, orders }
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
                color: C.text as string,
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
