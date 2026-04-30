import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, setError } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    const success = await login(username, password);
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
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
      </div>
    </div>
  );
}
