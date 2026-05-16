import type {
  AdminProfile,
  DashboardData,
  DashboardOrder,
} from "../interfaces";

import { apiUrl } from "../config/api";
import { getStoredItem } from "../utils/storage";

export async function getAdminDashboardData(): Promise<DashboardData> {
  const token = getStoredItem("adminToken");
  if (!token) {
    throw new Error("Please log in again to view the admin dashboard.");
  }

  const headers = { Authorization: `Bearer ${token}` };
  const [profileResponse, ordersResponse] = await Promise.all([
    fetch(apiUrl("/adminProfile"), { headers }),
    fetch(apiUrl("/orders"), { headers }),
  ]);

  if (!profileResponse.ok || !ordersResponse.ok) {
    throw new Error("Failed to fetch admin dashboard data.");
  }

  const adminProfile: AdminProfile = await profileResponse.json();
  const orders: DashboardOrder[] = await ordersResponse.json();

  return {
    adminProfile,
    orders,
  };
}
