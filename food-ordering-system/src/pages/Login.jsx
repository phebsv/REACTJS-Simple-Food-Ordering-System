import { useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../constants/colors";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon } from "../components/UInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) return setError("Email and password are required");

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4001/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      if (!res.ok) throw new Error("Login failed");
      const users = await res.json();
      if (!users.length) throw new Error("Invalid email or password");

      // Store user in localStorage if remember is checked
      if (remember) {
        localStorage.setItem("currentUser", JSON.stringify(users[0]));
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="LOG IN" />
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.red} 48%, ${C.cream} 48%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 1rem 3rem",
        position: "relative", overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <BgFood />
        <div style={{
          display: "flex", width: "100%", maxWidth: 880,
          minHeight: 510, borderRadius: 20, overflow: "hidden",
          boxShadow: "0 24px 70px rgba(0,0,0,0.22)", position: "relative", zIndex: 1,
        }}>
          <LeftPanel />
          <div style={{
            flex: 1, background: C.white,
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "2.5rem 3rem", position: "relative",
          }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Sign in</h1>
            <p style={{ fontSize: "0.9rem", color: C.muted, margin: "0 0 2px" }}>
              If you don't have an account register
            </p>
            <button onClick={() => navigate("/register")} style={{
              color: C.red, fontWeight: 700, fontSize: "0.9rem",
              background: "none", border: "none", padding: 0,
              cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              marginBottom: "1.5rem",
            }}>Register here !</button>

            <div style={{ marginBottom: "1.3rem" }}>
              <UInput label="Email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} Icon={MailIcon} />
            </div>
            <UInput label="Password" type="password" placeholder="Enter your Password" value={password} onChange={e => setPassword(e.target.value)} Icon={LockIcon} />

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: "1.2rem",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem", color: C.text }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: C.red, cursor: "pointer" }} />
                Remember me
              </label>
              <button style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.85rem", color: C.text, fontWeight: 500, fontFamily: "inherit",
              }}>Forgot Password ?</button>
            </div>

            {error && <p style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}

            <div style={{ marginTop: "1.8rem" }}>
              <RedBtn onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</RedBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}