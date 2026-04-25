const API_BASE_URL = "http://localhost:4001";

export async function getAdminDashboardData() {
  const [profileResponse, statsResponse, ordersResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/adminProfile`),
    fetch(`${API_BASE_URL}/orders`),
  ]);

  if (!profileResponse.ok || !ordersResponse.ok) {
    throw new Error("Failed to fetch admin dashboard data.");
  }

  const adminProfile = await profileResponse.json();
  const orders = await ordersResponse.json();

  return {
    adminProfile,
    orderStats,
    orders,
  };
}