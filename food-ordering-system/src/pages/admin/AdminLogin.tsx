// src/pages/admin/AdminLogin.tsx
// Connected to PHP /auth/admin_login.php via AdminContext

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, setError } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>NomNom Admin</h1>
          <p>Food Ordering System - Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@quickbite.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="admin-error-message">{error}</div>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? <LoadingSpinner /> : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#999", marginTop: "12px" }}>
          Default: admin@quickbite.com / admin123
        </p>
      </div>
    </div>
  );
}
