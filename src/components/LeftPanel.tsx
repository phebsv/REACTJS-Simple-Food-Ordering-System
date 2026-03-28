import C from "../constants/colors";
import NomNomLogo from "./NomNomLogo";
import burger from "../assets/burger1.png";

export default function LeftPanel() {
  return (
    <div style={{
      width: 360, flexShrink: 0,
      background: C.pink,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "2rem 2rem 0",
      position: "relative", overflow: "hidden",
    }}>
      <NomNomLogo size="lg" />

      <div style={{ marginTop: "-6rem", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{
          fontSize: "clamp(56px, 10vw, 76px)", fontWeight: 900, lineHeight: 0.88,
          color: C.red, textTransform: "uppercase", letterSpacing: "-2px",
          fontFamily: "'Arial Black', Arial, sans-serif",
        }}>SNACK</div>
        <div style={{
          fontSize: "clamp(56px, 10vw, 76px)", fontWeight: 900, lineHeight: 0.88,
          color: C.red, textTransform: "uppercase", letterSpacing: "-2px",
          fontFamily: "'Arial Black', Arial, sans-serif",
        }}>LUNCH</div>
      </div>

      <img
        src={burger}
        alt="Burger"
        style={{
          position: "absolute", bottom: 0, left: "50%",
          transform: "translateX(-50%) rotate(10deg)",
          width: 330,
          zIndex: 3,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.18))",
        }}
      />
    </div>
  );
}