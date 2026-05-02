// src/pages/Login.tsx
// Connected to PHP backend via AuthContext

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon } from "../components/UInput";
import { useAuth } from "../context/AuthContext";
import { loginAdmin } from "../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>("");

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLocalError("");

    if (!email || !password) {
      return setLocalError("Email and password are required.");
    }

    // 1. Try customer login first
    const customerSuccess = await login(email, password);
    if (customerSuccess) {
      navigate("/dashboard");
      return;
    }

    // 2. Fall back to admin login
    try {
      const res = await loginAdmin(email, password);
      const { token, admin } = res.data;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(admin));
      navigate("/admin/dashboard");
    } catch {
      setLocalError("Invalid email or password.");
    }
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
            <p className="login-subtitle">If you don't have an account register</p>
            <button onClick={() => navigate("/register")} className="login-register-btn">
              Register here !
            </button>

            <div className="login-input-group">
              <UInput
                label="Email"
                type="email"
                placeholder="Enter your email address"
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
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button className="login-forgot">Forgot Password ?</button>
            </div>

            {displayError && <p className="login-error">{displayError}</p>}

            <div className="login-btn-container">
              <RedBtn onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </RedBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}