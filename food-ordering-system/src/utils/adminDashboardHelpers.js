export function getOrderStats(orders) {
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