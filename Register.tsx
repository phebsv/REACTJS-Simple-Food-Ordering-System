import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon, UserIcon, PhoneIcon } from "../components/UInput";
import { createUser, findUserByEmail } from "../services/api";
import "./Register.css";

export default function Register() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="REGISTER" />
      <div className="register-container">
        <BgFood />
        <div className="register-card">
          <LeftPanel />
          <div className="register-form">
            <button onClick={() => navigate("/login")} className="register-back-btn">←</button>

            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="register-signin-btn">Sign in here !</button>
            </p>

            <div className="register-names">
              <UInput label="First Name" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} Icon={UserIcon} />
              <UInput label="Last Name" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} Icon={UserIcon} />
            </div>
            <div className="register-input-group">
              <UInput label="Email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} Icon={MailIcon} />
            </div>
            <div className="register-input-group">
              <UInput label="Phone Number" type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} Icon={PhoneIcon} />
            </div>
            <UInput label="Password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} Icon={LockIcon} />

            <label className="register-agree">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span>
                I agree to the{" "}
                <button>Terms of Service</button>{" "}and{" "}
                <button>Privacy Policy</button>
              </span>
            </label>

            {error && <p className="register-error">{error}</p>}

            <div className="register-btn-container">
              <RedBtn onClick={handleRegister} disabled={loading}>{loading ? "Creating..." : "Create Account"}</RedBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}