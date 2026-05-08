import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import burger1 from "../../assets/burger1.png";
import burger2 from "../../assets/burger2.png";
import chicken1 from "../../assets/chicken1.png";
import pizza1 from "../../assets/pizza1.png";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar title="DASHBOARD" showNavLinks={true} />
      <div className="dashboard-container">
        <BgFood />
        <div className="dashboard-intro">
          <div className="dashboard-offer">
            <div className="dashboard-text">
              <div className="dashboard-hot">Crispy, Every Bite Taste</div>
              <div className="dashboard-spicy">Hot Spicy Chicken Burger</div>
              <div className="dashboard-limited">Limited Offer / ₱5</div>
              <button onClick={() => navigate("/menu")} className="dashboard-order-btn">
                Order Now
              </button>
            </div>
            <img src={burger1} alt="Burger" className="dashboard-burger-img" />
          </div>

          <div className="dashboard-popular">
            <p className="dashboard-popular-kicker">The Best</p>
            <h2>Popular Food Items</h2>
            <div className="dashboard-popular-grid">
              <div className="dashboard-food-card">
                <img src={pizza1} alt="Pizza" />
                <button onClick={() => navigate("/menu")}>Order Now</button>
              </div>
              <div className="dashboard-food-card">
                <img src={burger2} alt="Burger meal" />
                <button onClick={() => navigate("/menu")}>Order Now</button>
              </div>
              <div className="dashboard-food-card">
                <img src={chicken1} alt="Chicken meal" />
                <button onClick={() => navigate("/menu")}>Order Now</button>
              </div>
            </div>
          </div>

          <div className="dashboard-service">
            <p className="dashboard-service-kicker">Food Processing</p>
            <h1 className="dashboard-welcome">How We Serve You?</h1>
            <div className="dashboard-service-grid">
              <div className="dashboard-service-item">
                <h3>Cooking With Care</h3>
                <p>Fresh food prepared carefully for every order.</p>
              </div>
              <div className="dashboard-service-item featured">
                <h3>Quickly Delivery</h3>
                <p>Fast checkout and delivery for a smoother food experience.</p>
              </div>
              <div className="dashboard-service-item">
                <h3>Choose Food</h3>
                <p>Browse favorites and pick the meal you like best.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
