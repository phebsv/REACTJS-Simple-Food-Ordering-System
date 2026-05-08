import type { DashboardOrder, OrderStat } from "../interfaces";

export function getOrderStats(orders: DashboardOrder[]): OrderStat[] {
  return [
    {
      label: "TOTAL ORDERS",
      value: orders.length,
      icon: "Orders",
    },
    {
      label: "ON PROCESS",
      value: orders.filter((order) => order.status === "on process").length,
      icon: "Process",
    },
    {
      label: "COMPLETED",
      value: orders.filter((order) => order.status === "completed").length,
      icon: "Done",
    },
    {
      label: "CANCELED",
      value: orders.filter((order) => order.status === "canceled").length,
      icon: "X",
    },
  ];
}
