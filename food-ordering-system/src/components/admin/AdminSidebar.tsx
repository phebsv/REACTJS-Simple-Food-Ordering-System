import React from "react";
import C from "../../constants/colors";

function AdminSidebar() {
  const menuItems = [
    "DASHBOARD",
    "ORDERS",
    "MENU",
    "INVENTORY",
    "REVIEWS",
    "SETTINGS",
  ];

  return (
    <aside
      style={{
        width: "180px",
        backgroundColor: C.redDark,
        color: C.white,
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "86px",
          height: "42px",
          backgroundColor: C.white,
          borderRadius: "6px",
          color: C.red,
          fontSize: "11px",
          fontWeight: "900",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: "12px",
          marginBottom: "26px",
        }}
      >
        NomNom
        <br />
        NOW
      </div>
      <nav style={{ width: "100%" }}>
        {menuItems.map((item) => {
          const isActive = item === "DASHBOARD";
          return (
            <div
              key={item}
              style={{
                padding: "14px 10px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: "900",
                cursor: "pointer",
                backgroundColor: isActive ? C.red : "transparent",
                color: C.white,
              }}
            >
              {item}
            </div>
          );
        })}
      </nav>
      <div
        style={{
          marginTop: "auto",
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: "900",
          cursor: "pointer",
        }}
      >
        LOG OUT
      </div>
    </aside>
  );
}

export default AdminSidebar;
