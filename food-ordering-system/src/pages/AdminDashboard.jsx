import React from "react";
import C from "../constants/colors";

function AdminDashboard() {
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
                ORDERS
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
                  placeholder="Search"
                  disabled
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
                  JASON CONOPIO
                </h3>

                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "9px",
                    fontWeight: "700",
                    color: C.text,
                  }}
                >
                  Admin
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

          {/* Content placeholder */}
          <section
            style={{
              backgroundColor: C.white,
              borderRadius: "10px",
              padding: "30px",
              minHeight: "480px",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "900",
                color: C.text,
              }}
            >
              Admin dashboard content will go here.
            </h2>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;