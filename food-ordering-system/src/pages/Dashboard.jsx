import { useNavigate } from "react-router-dom";
import C from "../constants/colors";
import Navbar from "../components/Navbar";
import burger1 from "../assets/burger1.png";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar title="DASHBOARD" showNavLinks={true} />
      <div style={{
        minHeight: "100vh", background: C.cream,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        paddingTop: 64,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ textAlign: "left", color: C.text }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>hot spicy</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>chicken burger</div>
              <div style={{ fontSize: "1.2rem", color: C.red, fontWeight: 600 }}>limited offer / $5</div>
            </div>
            <img src={burger1} alt="Burger" style={{ width: 200, height: 200 }} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: C.red }}>Welcome to NomNom!</h1>
          <button onClick={() => navigate("/login")} style={{
            marginTop: 24, padding: "12px 32px",
            background: C.red, color: C.white,
            border: "none", borderRadius: 50,
            fontWeight: 700, fontSize: "1rem", cursor: "pointer",
          }}>Logout</button>
        </div>
      </div>
    </>
  );
}