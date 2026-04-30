import type { AdminProfile, DashboardData, Order } from "../interfaces";

const API_BASE_URL = "http://localhost:3001";

export async function getAdminDashboardData(): Promise<DashboardData> {
  // Note: I removed statsResponse as it wasn't being used in your original fetch logic
  const [profileResponse, ordersResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/adminProfile`),
    fetch(`${API_BASE_URL}/orders`),
  ]);

  if (!profileResponse.ok || !ordersResponse.ok) {
    throw new Error("Failed to fetch admin dashboard data.");
  }

  const adminProfile: AdminProfile = await profileResponse.json();
  const orders: Order[] = await ordersResponse.json();

  return {
    adminProfile,
    orders,
  };
}
