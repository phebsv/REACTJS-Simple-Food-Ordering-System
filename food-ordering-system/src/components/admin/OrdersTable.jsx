import React from "react";
import C from "../../constants/colors";

function OrdersTable({ orders, activeStatus, onStatusChange }) {
  const orderTabs = ["all", "on process", "completed", "canceled"];

  return (
    <section
      style={{
        backgroundColor: C.white,
        borderRadius: "14px",
        padding: "14px 28px 34px",
        boxSizing: "border-box",
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        style={{
          width: "430px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          backgroundColor: C.redDark,
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        {orderTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onStatusChange(tab)}
            style={{
              border: "none",
              backgroundColor: activeStatus === tab ? C.red : C.redDark,
              color: C.white,
              fontSize: "10px",
              fontWeight: "900",
              padding: "10px 6px",
              cursor: "pointer",
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          fontSize: "12px",
          color: C.text,
        }}
      >
        <thead>
          <tr>
            {[
              "order id",
              "date",
              "customer name",
              "address",
              "quantity",
              "amount",
              "status",
            ].map((heading) => (
              <th
                key={heading}
                style={{
                  padding: "10px",
                  fontWeight: "800",
                  borderBottom: "1px solid #bdbdbd",
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td style={tableCellStyle}>{order.orderId}</td>
              <td style={tableCellStyle}>{order.date}</td>
              <td style={tableCellStyle}>{order.customerName}</td>
              <td style={tableCellStyle}>{order.address}</td>
              <td style={tableCellStyle}>{order.quantity}</td>
              <td style={tableCellStyle}>₱{order.amount.toFixed(1)}</td>
              <td style={tableCellStyle}>
                <span style={getStatusBadgeStyle(order.status)}>{order.status}</span>
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td
                colSpan="7"
                style={{
                  padding: "20px",
                  color: C.muted,
                  fontWeight: "700",
                }}
              >
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

const tableCellStyle = {
  padding: "13px 10px",
  borderBottom: "1px solid #bdbdbd",
};

const getStatusBadgeStyle = (status) => {
  const baseStyle = {
    display: "inline-block",
    minWidth: "82px",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "capitalize",
  };

  if (status === "completed") {
    return {
      ...baseStyle,
      backgroundColor: "#E8F7EE",
      color: "#1E7D3A",
    };
  }

  if (status === "on process") {
    return {
      ...baseStyle,
      backgroundColor: "#FFF4D8",
      color: "#9A6A00",
    };
  }

  if (status === "canceled") {
    return {
      ...baseStyle,
      backgroundColor: "#FFE5E5",
      color: C.redDark,
    };
  }

  return {
    ...baseStyle,
    backgroundColor: "#EEEEEE",
    color: C.text,
  };
};

export default OrdersTable;