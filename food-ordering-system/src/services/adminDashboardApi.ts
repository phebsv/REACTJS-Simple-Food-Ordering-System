const API_BASE_URL = "http://localhost:4001";

// 1. Define the shape of the Admin Profile
interface AdminProfile {
  name: string;
  role: string;
}

// 2. Define the shape of an Order
interface Order {
  orderId: string;
  date: string;
  customerName: string;
  address: string;
  quantity: number;
  amount: number;
  status: string;
}

// 3. Define the return type of the function
interface DashboardData {
  adminProfile: AdminProfile;
  orders: Order[];
}

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
