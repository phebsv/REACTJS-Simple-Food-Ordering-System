// src/pages/Login.tsx
// Connected to Express backend via AuthContext

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon } from "../components/UInput";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";
import { validateLoginForm } from "../utils/validationHelpers";
import type { AuthUser } from "../services/api.ts";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");

  const { login, loading, error } = useAuth();
  const { login: loginAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLocalError("");

    const loginId = email.trim();

    // Validate form data
    const validation = validateLoginForm({ loginId, password });
    if (!validation.valid) {
      return setLocalError(validation.error || "Validation failed.");
    }

    const customerSuccess = await login(loginId, password, { remember: false });
    if (!customerSuccess) {
      return;
    }

    const rawUser = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;

    if (user?.role === "admin" || user?.isAdmin) {
      const adminSuccess = await loginAdmin(loginId, password);
      if (adminSuccess) {
        navigate("/admin/dashboard");
      }
      return;
    }

    navigate("/dashboard");
  };

  const displayError = localError || error;

  return (
    <>
      <Navbar title="LOG IN" />
      <div className="login-container">
        <BgFood />
        <div className="login-card">
          <LeftPanel />
          <div className="login-form">
            <h1 className="login-title">Sign in</h1>
            <p className="login-subtitle">
              If you don't have an account register
            </p>
            <button
              onClick={() => navigate("/register")}
              className="login-register-btn"
            >
              Register here !
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) handleLogin();
              }}
            >
              <div className="login-input-group">
                <UInput
                  label="Email or username"
                  type="text"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  Icon={MailIcon}
                />
              </div>
              <UInput
                label="Password"
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                Icon={LockIcon}
              />

              <div className="login-options">
              </div>

              {displayError && <p className="login-error">{displayError}</p>}

              <div className="login-btn-container">
                <RedBtn type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </RedBtn>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
