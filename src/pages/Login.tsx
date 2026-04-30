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
  const [credential, setCredential] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!credential || !password) return setError("Username and password are required");

    setLoading(true);
    try {
      // Check if admin (credential as username in admins table)
      const adminRes = await fetch(`http://localhost:4001/admins?username=${encodeURIComponent(credential)}`);
      if (adminRes.ok) {
        const admins = await adminRes.json();
        const admin = admins.find((a: any) => a.password === password);
        if (admin) {
          localStorage.removeItem("currentUser");
          localStorage.setItem("adminUser", JSON.stringify(admin));
          navigate("/admin/dashboard");
          return;
        }
      }

      // Check if customer (credential as username in users table)
      const userRes = await fetch(`http://localhost:4001/users?username=${encodeURIComponent(credential)}&password=${encodeURIComponent(password)}`);
      if (!userRes.ok) throw new Error("Login failed");
      const users = await userRes.json();
      if (!users.length) throw new Error("Invalid credentials");

      localStorage.removeItem("adminUser");

      // Always store currentUser (for session persistence across pages)
      localStorage.setItem("currentUser", JSON.stringify(users[0]));

      navigate("/dashboard");
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
              <UInput label="Username" type="text" placeholder="Enter your username" value={credential} onChange={e => setCredential(e.target.value)} Icon={MailIcon} />
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