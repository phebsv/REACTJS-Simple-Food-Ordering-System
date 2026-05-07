import type {
  AdminProfile,
  DashboardData,
  DashboardOrder,
} from "../interfaces";

const API_BASE_URL = "http://localhost:3001";

export async function getAdminDashboardData(): Promise<DashboardData> {
  const [profileResponse, ordersResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/adminProfile`),
    fetch(`${API_BASE_URL}/orders`),
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