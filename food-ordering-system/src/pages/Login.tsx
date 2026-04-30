import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon } from "../components/UInput";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
  setError("");

  if (!email || !password) {
    return setError("Email and password are required");
  }

  setLoading(true);

  try {
    const userRes = await fetch(
      `http://localhost:3001/users?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`
    );

    if (!userRes.ok) throw new Error("Login failed");

    const users = await userRes.json();

    if (users.length > 0) {
      if (remember) {
        localStorage.setItem("currentUser", JSON.stringify(users[0]));
      }

      navigate("/dashboard");
      return;
    }

    const adminRes = await fetch("http://localhost:3001/admins");

    if (!adminRes.ok) throw new Error("Login failed");

    const admins = await adminRes.json();

    const matchedAdmin = admins.find(
      (admin: any) =>
        String(admin.username).trim().toLowerCase() === email.trim().toLowerCase() &&
        String(admin.password).trim() === password.trim()
    );

    if (matchedAdmin) {
      localStorage.setItem("adminUser", JSON.stringify(matchedAdmin));
      navigate("/admin/dashboard");
      return;
    }
    throw new Error("Invalid email or password");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setLoading(false);
  }
};

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
            <button onClick={() => navigate("/register")} className="login-register-btn">Register here !</button>

            <div className="login-input-group">
              <UInput label="Email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} Icon={MailIcon} />
            </div>
            <UInput label="Password" type="password" placeholder="Enter your Password" value={password} onChange={e => setPassword(e.target.value)} Icon={LockIcon} />

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button className="login-forgot">Forgot Password ?</button>
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="login-btn-container">
              <RedBtn onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</RedBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}