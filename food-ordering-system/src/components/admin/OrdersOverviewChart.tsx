import React from "react";
import C from "../../constants/colors";

function OrdersOverviewChart() {
  return (
    <div
      style={{
        backgroundColor: C.red,
        borderRadius: "10px",
        padding: "18px 24px",
        color: C.white,
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: "900" }}>
        ORDERS OVERVIEW
      </h2>
      <div
        style={{
          height: "210px",
          border: "1px solid rgba(255,255,255,0.28)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[0, 1, 2, 3].map((line) => (
          <div
            key={`horizontal-${line}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${line * 33}%`,
              borderTop: "1px solid rgba(255,255,255,0.18)",
            }}
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <div
            key={`vertical-${line}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${line * 20}%`,
              borderLeft: "1px solid rgba(255,255,255,0.18)",
            }}
          />
        ))}
        <svg
          viewBox="0 0 500 170"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            left: 0,
            top: 0,
          }}
        >
          <polyline
            points="0,158 85,150 160,142 245,118 330,154 420,144 500,132"
            fill="none"
            stroke="#3d7cff"
            strokeWidth="2"
          />
          <polygon
            points="0,158 85,150 160,142 245,118 330,154 420,144 500,132 500,170 0,170"
            fill="rgba(61,124,255,0.25)"
          />
        </svg>
      </div>
    </div>
  );
}

export default OrdersOverviewChart;
