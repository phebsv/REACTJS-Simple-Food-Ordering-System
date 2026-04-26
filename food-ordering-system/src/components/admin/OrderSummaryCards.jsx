import React from "react";
import C from "../../constants/colors";

function OrderSummaryCards({ orderStats }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
      }}
    >
      {orderStats.map((stat) => (
        <div
          key={stat.label}
          style={{
            minHeight: "115px",
            backgroundColor: C.red,
            borderRadius: "10px",
            color: C.white,
            padding: "18px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              fontSize: "30px",
              fontWeight: "900",
              color: C.text,
            }}
          >
            {stat.icon}
          </div>

          <h2
            style={{
              margin: "28px 0 5px",
              fontSize: "30px",
              fontWeight: "900",
            }}
          >
            {stat.value}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: "900",
            }}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default OrderSummaryCards;