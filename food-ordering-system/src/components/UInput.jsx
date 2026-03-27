import { useState } from "react";
import C from "../constants/colors";

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const EyeIcon = ({ show }) => show ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export { MailIcon, LockIcon, UserIcon, PhoneIcon, EyeIcon };

export default function UInput({ label, type = "text", placeholder, Icon, value, onChange }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPass = type === "password";

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: C.text, marginBottom: "6px" }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        borderBottom: `1.5px solid ${focused ? C.redDark : C.red}`,
        paddingBottom: "7px", transition: "border-color 0.2s",
      }}>
        {Icon && <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}><Icon /></span>}
        <input
          type={isPass ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: "0.93rem", color: C.text,
            background: "transparent", fontFamily: "inherit",
          }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
            <EyeIcon show={show} />
          </button>
        )}
      </div>
    </div>
  );
}