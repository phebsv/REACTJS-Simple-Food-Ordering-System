import type {
  AdminProfile,
  DashboardData,
  DashboardOrder,
} from "../interfaces";

import { apiUrl } from "../config/api";

export async function getAdminDashboardData(): Promise<DashboardData> {
  const [profileResponse, ordersResponse] = await Promise.all([
    fetch(apiUrl("/adminProfile")),
    fetch(apiUrl("/orders")),
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