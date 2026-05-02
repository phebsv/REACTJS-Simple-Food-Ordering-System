// src/interfaces/index.ts
// Shared TypeScript interfaces — matches your PHP JSON schema exactly

export interface Customer {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface MenuItem {
  menu_id: number;
  food_name: string;
  description: string;
  price: number;
  category: string;
  availability_status: boolean;
}

export interface CartItem {
  cart_item_id: number;
  menu_id: number;
  food_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Delivered";

export interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;
  total_amount: number;
  order_status: OrderStatus;
}

export interface OrderItem {
  order_item_id: number;
  food_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
}

export interface Admin {
  admin_id: number;
  name: string;
  email: string;
}

export interface AdminProfile {
  name: string;
  role: string;
}

// ── AdminContext data shapes ──────────────────────────────────────────────────

// Mapped from PHP MenuItem to match AdminMenu.tsx's FoodItem interface
export interface FoodItem {
  id: string;           // menu_id as string
  name: string;         // food_name
  category: string;
  price: number;
  description: string;
  image?: string;
  available: boolean;   // availability_status
  stock?: number;
}

// Mapped from PHP Order to match AdminOrders.tsx's Order interface
export interface AdminOrder {
  id: string;           // order_id as string
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: AdminOrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus | "Cancelled";
  createdAt: string;    // order_date
  updatedAt: string;
  paymentMethod?: string;
  deliveryNotes?: string;
}

export interface AdminOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// For AdminInventory.tsx
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: "Available" | "Low Stock" | "Out of Stock" | "Unavailable";
  lastUpdated: string;
}

// For AdminReviews.tsx (not in PHP backend yet — uses mock data)
export interface Review {
  id: string;
  customerName: string;
  foodItemName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  hidden: boolean;
}
