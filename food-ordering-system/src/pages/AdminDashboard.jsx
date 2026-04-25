import React, { useState } from "react";
import C from "../constants/colors";

function AdminDashboard() {

  const adminProfile = {
  name: "JASON CONOPIO",
  role: "Admin",
};

const orderStats = [
  {
    label: "TOTAL ORDERS",
    value: 5,
    icon: "🛍️",
  },
  {
    label: "ON PROCESS",
    value: 3,
    icon: "⟳",
  },
  {
    label: "COMPLETED",
    value: 2,
    icon: "✓",
  },
  {
    label: "CANCELED",
    value: 0,
    icon: "×",
  },
];

const orders = [
  {
    orderId: "ord100",
    date: "2026-7-22",
    customerName: "jason conopio",
    address: "tabunoc, talisay city",
    quantity: 1,
    amount: 500,
    status: "completed",
  },
  {
    orderId: "ord101",
    date: "2026-10-5",
    customerName: "ryan cruz",
    address: "minglanilla",
    quantity: 3,
    amount: 750,
    status: "on process",
  },
  {
    orderId: "ord102",
    date: "2026-8-20",
    customerName: "jane yu",
    address: "naga",
    quantity: 6,
    amount: 1500,
    status: "canceled",
  },
];

const [activeStatus, setActiveStatus] = useState("all");
const [searchTerm, setSearchTerm] = useState("");

const orderTabs = ["all", "on process", "completed", "canceled"];

const filteredOrders = orders.filter((order) => {
  const matchesStatus =
    activeStatus === "all" || order.status === activeStatus;

  const searchValue = searchTerm.toLowerCase();

  const matchesSearch =
    order.orderId.toLowerCase().includes(searchValue) ||
    order.date.toLowerCase().includes(searchValue) ||
    order.customerName.toLowerCase().includes(searchValue) ||
    order.address.toLowerCase().includes(searchValue) ||
    order.status.toLowerCase().includes(searchValue);

  return matchesStatus && matchesSearch;
});

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.cream,
        fontFamily: "Arial, sans-serif",
      }}
    >
    <div
       style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        backgroundColor: C.cream,
        overflow: "hidden",
     }}
    >
        {/* Sidebar */}
        <aside
          style={{
            width: "145px",
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
            {["DASHBOARD", "ORDERS", "MENU", "INVENTORY", "REVIEWS", "SETTINGS"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    padding: "14px 10px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </div>
              )
            )}
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

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: "22px 28px",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              gap: "20px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "900",
                  color: C.text,
                }}
              >
                DASHBOARD
              </h1>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: C.text,
                }}
              >
                <span style={{ color: C.red, fontWeight: "700" }}>
                  Dashboard
                </span>{" "}
                / Orders
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "300px",
                  height: "38px",
                  backgroundColor: C.white,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  boxSizing: "border-box",
                }}
              >
                <span style={{ marginRight: "8px", fontSize: "17px" }}>⌕</span>

                <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontSize: "12px",
                    }}
                    />
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: "900",
                    color: C.text,
                  }}
                >
                  {adminProfile.name}
                </h3>

                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "9px",
                    fontWeight: "700",
                    color: C.text,
                  }}
                >
                  {adminProfile.role}
                </p>
              </div>

              <div
                style={{
                  width: "38px",
                  height: "34px",
                  borderRadius: "9px",
                  backgroundColor: C.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.white,
                  fontSize: "18px",
                  fontWeight: "900",
                }}
              >
                A
              </div>
            </div>
          </header>

{/* Cards and Chart */}
<section
  style={{
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
    marginBottom: "24px",
  }}
>
  {/* Order Summary Cards */}
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

  {/* Orders Overview Chart Placeholder */}
  <div
    style={{
      backgroundColor: C.red,
      borderRadius: "10px",
      padding: "18px 24px",
      color: C.white,
      boxSizing: "border-box",
    }}
  >
    <h2
      style={{
        margin: "0 0 12px",
        fontSize: "18px",
        fontWeight: "900",
      }}
    >
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
</section>

            {/* Orders Table */}
<section
  style={{
    backgroundColor: C.white,
    borderRadius: "10px",
    padding: "8px 28px 34px",
    boxSizing: "border-box",
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
    onClick={() => setActiveStatus(tab)}
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
      {filteredOrders.map((order) => (
        <tr key={order.orderId}>
          <td style={tableCellStyle}>{order.orderId}</td>
          <td style={tableCellStyle}>{order.date}</td>
          <td style={tableCellStyle}>{order.customerName}</td>
          <td style={tableCellStyle}>{order.address}</td>
          <td style={tableCellStyle}>{order.quantity}</td>
          <td style={tableCellStyle}>₱{order.amount.toFixed(1)}</td>
          <td style={tableCellStyle}>{order.status}</td>
        </tr>
      ))}
      {filteredOrders.length === 0 && (
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
        </main>
      </div>
    </div>
  );
}
const tableCellStyle = {
  padding: "13px 10px",
  borderBottom: "1px solid #bdbdbd",
};

export default AdminDashboard;