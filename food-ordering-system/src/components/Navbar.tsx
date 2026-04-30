import { Link } from "react-router-dom";
import C from "../constants/colors";
import NomNomLogo from "./NomNomLogo";

interface NavbarProps {
  title: string;
  showNavLinks?: boolean;
}

const handleLogout = () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("adminUser");
  window.location.href = "/login";
};

export default function Navbar({ title, showNavLinks = false }: NavbarProps) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 64,
      background: C.white, display: "flex", alignItems: "center",
      padding: "0 2rem", gap: "1.2rem", zIndex: 100,
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <NomNomLogo size="sm" />
        <div style={{ width: 1, height: 30, background: "#E0D0D0" }} />
        <span style={{
          fontSize: 22, fontWeight: 900, color: C.text,
          letterSpacing: "2px", textTransform: "uppercase",
          fontFamily: "'Arial Black', Arial, sans-serif",
        }}>{title}</span>
      </div>
      {showNavLinks && (
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link to="/dashboard" style={{ textDecoration: "none", color: C.text, fontWeight: 600, fontSize: 14 }}>Home</Link>
          <Link to="/menu" style={{ textDecoration: "none", color: C.text, fontWeight: 600, fontSize: 14 }}>Menu</Link>
          <Link to="/cart" style={{ textDecoration: "none", color: C.text, fontWeight: 600, fontSize: 20 }}>≡ƒ¢Æ</Link>
          <Link to="/my-orders" style={{ textDecoration: "none", color: C.text, fontWeight: 600, fontSize: 14 }}>Orders</Link>
          <Link to="/profile" style={{ textDecoration: "none", color: C.text, fontWeight: 600, fontSize: 14 }}>Profile</Link>
          <button 
            onClick={handleLogout}
            style={{
              background: "var(--red)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Logout
          </button>
        </nav>
      )}
    </div>
  );
}
