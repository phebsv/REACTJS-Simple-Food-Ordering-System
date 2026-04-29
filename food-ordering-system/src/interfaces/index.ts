import type { ReactNode } from "react";

export interface AdminProfile {
  name: string;
  role: string;
}

export interface Order {
  orderId: string;
  date: string;
  customerName: string;
  address: string;
  quantity: number;
  amount: number;
  status: string;
}

export interface OrderStat {
  label: string;
  value: number | string;
  icon: string | ReactNode;
}

export interface DashboardData {
  adminProfile: AdminProfile;
  orders: Order[];
}

export interface OrderSummaryCardsProps {
  orderStats: OrderStat[];
}

export interface OrdersTableProps {
  orders: Order[];
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export interface AdminHeaderProps {
  adminProfile: AdminProfile;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}
