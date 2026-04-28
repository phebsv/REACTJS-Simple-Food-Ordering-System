// 1. Define the shape of an Order to ensure we can check order.status safely
interface Order {
  status: string;
  // you can add other properties if needed, but 'status' is the one we use here
}

// 2. Define the shape of the objects in the returned array
interface OrderStat {
  label: string;
  value: number;
  icon: string;
}

export function getOrderStats(orders: Order[]): OrderStat[] {
  return [
    {
      label: "TOTAL ORDERS",
      value: orders.length,
      icon: "🛍️",
    },
    {
      label: "ON PROCESS",
      value: orders.filter((order) => order.status === "on process").length,
      icon: "⟳",
    },
    {
      label: "COMPLETED",
      value: orders.filter((order) => order.status === "completed").length,
      icon: "✓",
    },
    {
      label: "CANCELED",
      value: orders.filter((order) => order.status === "canceled").length,
      icon: "×",
    },
  ];
}
