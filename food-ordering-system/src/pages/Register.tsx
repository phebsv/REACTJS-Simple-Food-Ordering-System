// src/pages/Register.tsx
// Connected to Express /auth/register route via AuthContext

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import BgFood from "../components/BgFood";
import UInput from "../components/UInput";
import RedBtn from "../components/RedBtn";
import { MailIcon, LockIcon, UserIcon, PhoneIcon } from "../components/UInput";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

export default function Register() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>("");

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLocalError("");

    if (!agree) return setLocalError("Please agree to the terms.");
    if (!firstName || !lastName || !email || !phone || !password)
      return setLocalError("All fields are required.");
    if (password.length < 6)
      return setLocalError("Password must be at least 6 characters.");

    const success = await register({
      firstName,
      lastName,
      email,
      password,
      phoneNumber: phone,
      agreeToTerms: agree,
    });

    if (success) {
      navigate("/login");
    }
  };

  const displayError = localError || error;

  return (
    <>
      <Navbar title="REGISTER" />
      <div className="register-container">
        <BgFood />
        <div className="register-card">
          <LeftPanel />
          <div className="register-form">
            <button
              onClick={() => navigate("/login")}
              className="register-back-btn"
            >
              ←
            </button>

            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="register-signin-btn"
              >
                Sign in here !
              </button>
            </p>

            <div className="register-names">
              <UInput
                label="First Name"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                Icon={UserIcon}
              />
              <UInput
                label="Last Name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                Icon={UserIcon}
              />
            </div>
            <div className="register-input-group">
              <UInput
                label="Email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                Icon={MailIcon}
              />
            </div>
            <div className="register-input-group">
              <UInput
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                Icon={PhoneIcon}
              />
            </div>
            <UInput
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              Icon={LockIcon}
            />

            <label className="register-agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I agree to the <button type="button">Terms of Service</button>{" "}
                and <button type="button">Privacy Policy</button>
              </span>
            </label>

            {displayError && <p className="register-error">{displayError}</p>}

            <div className="register-btn-container">
              <RedBtn onClick={handleRegister} disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </RedBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
