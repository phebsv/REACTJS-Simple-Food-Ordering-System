import { useLocation, useNavigate } from "react-router-dom";
import C from "../../constants/colors";
import { useAdmin } from "../../context/AdminContext";
import logo from "../../assets/logo1.png";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAdmin();

  const menuItems = [
    { label: "DASHBOARD", path: "/admin/dashboard" },
    { label: "ORDERS", path: "/admin/orders" },
    { label: "MENU", path: "/admin/menu" },
    { label: "INVENTORY", path: "/admin/inventory" },
    { label: "REVIEWS", path: "/admin/reviews" },
    { label: "SETTINGS", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    logout();
    navigate("/login");
  };

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
          width: "116px",
          height: "68px",
          backgroundColor: C.white,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "8px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <img
          src={logo}
          alt="Nomnom Now"
          style={{
            width: "180px",
            height: "180px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      </div>

      {admin?.name && (
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            opacity: 0.9,
            marginBottom: "18px",
            textAlign: "center",
          }}
        >
          {admin.name}
        </div>
      )}

      <nav style={{ width: "100%" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                padding: "14px 10px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: "900",
                cursor: "pointer",
                backgroundColor: isActive ? C.red : "transparent",
                color: C.white,
                transition: "0.2s ease",
              }}
            >
              {item.label}
            </div>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "auto",
          marginBottom: "8px",
          background: "transparent",
          border: "none",
          color: C.white,
          fontSize: "13px",
          fontWeight: "900",
          cursor: "pointer",
        }}
      >
        LOG OUT
      </button>
    </aside>
  );
}

export default AdminSidebar;
