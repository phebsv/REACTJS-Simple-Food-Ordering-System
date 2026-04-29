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
        <div className="dashboard-content">
          <div className="dashboard-offer">
            <div className="dashboard-text">
              <div className="dashboard-hot">hot spicy</div>
              <div className="dashboard-spicy">chicken burger</div>
              <div className="dashboard-limited">limited offer / $5</div>
            </div>
            <img src={burger1} alt="Burger" className="dashboard-burger-img" />
          </div>
          <h1 className="dashboard-welcome">Welcome to NomNom!</h1>
          <button onClick={() => navigate("/login")} className="dashboard-logout-btn">Logout</button>
        </div>
      </div>
    </>
  );
}