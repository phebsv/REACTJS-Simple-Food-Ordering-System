export type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available?: boolean;
  stock?: number;
};

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<FoodItem & { quantity: number }>;
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: "Available" | "Low Stock" | "Out of Stock" | "Unavailable";
  lastUpdated: string;
};

export type Review = {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  foodItemId: string;
  foodItemName: string;
  rating: number;
  comment: string;
  createdAt: string;
  hidden: boolean;
};

export type AdminUser = {
  id: string;
  username: string;
  password: string;
  role: "admin";
  createdAt: string;
};
