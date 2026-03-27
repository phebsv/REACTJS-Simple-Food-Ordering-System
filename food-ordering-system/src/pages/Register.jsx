import { useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../constants/colors";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon, UserIcon, PhoneIcon } from "../components/UInput";
import { createUser, findUserByEmail } from "../services/api";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!agree) return setError("Please agree to the terms");
    if (!firstName || !lastName || !email || !phone || !password) return setError("All fields are required");

    const existing = await findUserByEmail(email);
    if (existing) return setError("Email already taken");

    setLoading(true);
    try {
      await createUser({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="REGISTER" />
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
          minHeight: 530, borderRadius: 20, overflow: "hidden",
          boxShadow: "0 24px 70px rgba(0,0,0,0.22)", position: "relative", zIndex: 1,
        }}>
          <LeftPanel />
          <div style={{
            flex: 1, background: C.white,
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "2rem 2.8rem", position: "relative",
          }}>
            <button onClick={() => navigate("/login")} style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: "50%",
              border: "1.5px solid #E0D0D0", background: "transparent",
              cursor: "pointer", fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center", color: C.text,
            }}>←</button>

            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Create Account</h1>
            <p style={{ fontSize: "0.88rem", color: C.muted, margin: "0 0 1.4rem" }}>
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} style={{
                color: C.red, fontWeight: 700, fontSize: "0.88rem",
                background: "none", border: "none", padding: 0,
                cursor: "pointer", fontFamily: "inherit",
              }}>Sign in here !</button>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
              <UInput label="First Name" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} Icon={UserIcon} />
              <UInput label="Last Name" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} Icon={UserIcon} />
            </div>
            <div style={{ marginBottom: "1.2rem" }}>
              <UInput label="Email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} Icon={MailIcon} />
            </div>
            <div style={{ marginBottom: "1.2rem" }}>
              <UInput label="Phone Number" type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} Icon={PhoneIcon} />
            </div>
            <UInput label="Password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} Icon={LockIcon} />

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: "1.1rem", cursor: "pointer" }}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: C.red, cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.5 }}>
                I agree to the{" "}
                <button style={{ color: C.red, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontFamily: "inherit" }}>
                  Terms of Service
                </button>{" "}and{" "}
                <button style={{ color: C.red, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontFamily: "inherit" }}>
                  Privacy Policy
                </button>
              </span>
            </label>

            {error && <p style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}

            <div style={{ marginTop: "1.2rem" }}>
              <RedBtn onClick={handleRegister} disabled={loading}>{loading ? "Creating..." : "Create Account"}</RedBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}