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
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>("");

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLocalError("");

    const phoneDigits = phone.replace(/\D/g, "");
    const emailTrimmed = email.trim();
    const first = firstName.trim();
    const last = lastName.trim();

    const isLikelyEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    const hasMinPasswordLen = password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!agree) return setLocalError("Please agree to the terms.");
    if (!first || !last || !emailTrimmed || !phoneDigits || !password || !confirmPassword)
      return setLocalError("All fields are required.");
    if (first.length < 2 || last.length < 2)
      return setLocalError("Please enter your full name.");
    if (!isLikelyEmail)
      return setLocalError("Please enter a valid email address.");
    if (phoneDigits.length < 10 || phoneDigits.length > 11)
      return setLocalError("Please enter a valid phone number.");
    if (!hasMinPasswordLen || !hasLetter || !hasNumber)
      return setLocalError("Password must be at least 8 characters and include a letter and a number.");
    if (password !== confirmPassword)
      return setLocalError("Passwords do not match.");

    const success = await register({
      firstName: first,
      lastName: last,
      email: emailTrimmed,
      password,
      phoneNumber: phoneDigits,
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
              Back
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
            <UInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
