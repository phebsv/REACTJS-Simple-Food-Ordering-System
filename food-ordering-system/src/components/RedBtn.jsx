import { useState } from "react";
import C from "../constants/colors";

export default function RedBtn({ children, onClick }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: "100%", padding: "14px",
        background: active ? "#7E0006" : hover ? C.redDark : C.red,
        color: C.white, border: "none", borderRadius: 50,
        fontSize: "1rem", fontWeight: 700, cursor: "pointer",
        letterSpacing: "0.5px", fontFamily: "inherit",
        transform: active ? "scale(0.98)" : "scale(1)",
        transition: "background 0.2s, transform 0.1s",
      }}
    >{children}</button>
  );
}