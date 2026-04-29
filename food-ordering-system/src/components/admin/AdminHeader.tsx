import C from "../../constants/colors";
import type { AdminHeaderProps } from "../../interfaces";

function AdminHeader({
  adminProfile,
  searchTerm,
  onSearchChange,
}: AdminHeaderProps) {
  return (
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
          <span style={{ color: C.red, fontWeight: "700" }}>Dashboard</span> /
          Orders
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
            onChange={(event) => onSearchChange(event.target.value)}
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
  );
}

export default AdminHeader;
