import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import burger1 from "../assets/burger1.png";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar title="DASHBOARD" showNavLinks={true} />
      <div className="dashboard-container">
        <div className="dashboard-intro">
          <div className="dashboard-offer">
            <div className="dashboard-text">
              <div className="dashboard-hot">hot spicy</div>
              <div className="dashboard-spicy">chicken burger</div>
              <div className="dashboard-limited">limited offer / $5</div>
            </div>
            <img src={burger1} alt="Burger" className="dashboard-burger-img" />
          </div>
          <div className="dashboard-welcome-panel">
            <h1 className="dashboard-welcome">Welcome to NomNom!</h1>
            <p className="dashboard-summary">
              This is your dashboard. Use the menu link above to browse food items and add them to your cart.
            </p>
            <button onClick={() => navigate("/menu")} className="dashboard-logout-btn">
              Go to Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
