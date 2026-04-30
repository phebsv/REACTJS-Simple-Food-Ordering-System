import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, adminUser } = useAdmin();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/admin/login");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>NomNom Admin</h2>
        <p className="admin-username">{adminUser?.username}</p>
      </div>

      <nav className="admin-sidebar-nav">
        <Link
          to="/admin/dashboard"
          className={`admin-nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
        >
          <span className="icon">📊</span>
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`admin-nav-item ${isActive("/admin/orders") ? "active" : ""}`}
        >
          <span className="icon">📦</span>
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/menu"
          className={`admin-nav-item ${isActive("/admin/menu") ? "active" : ""}`}
        >
          <span className="icon">🍔</span>
          <span>Menu</span>
        </Link>

        <Link
          to="/admin/inventory"
          className={`admin-nav-item ${isActive("/admin/inventory") ? "active" : ""}`}
        >
          <span className="icon">📦</span>
          <span>Inventory</span>
        </Link>

        <Link
          to="/admin/reviews"
          className={`admin-nav-item ${isActive("/admin/reviews") ? "active" : ""}`}
        >
          <span className="icon">⭐</span>
          <span>Reviews</span>
        </Link>
      </nav>

      <button className="admin-logout-btn" onClick={handleLogout}>
        <span className="icon">🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}
