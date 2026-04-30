import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import type { FoodItem } from "../types";
import "./Dashboard.css";

export default function CustomerDashboard() {
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("http://localhost:4001/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        const available = data.filter((item: FoodItem) => item.available !== false);
        setMenuItems(available.slice(0, 6));
      } catch (err) {
        console.error("Failed to load menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAddToCart = (item: FoodItem) => {
    addItem(item);
    setSelectedItemId(item.id);
  };

  return (
    <>
      <Navbar title="HOME" showNavLinks={true} />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-offer">
            <div className="dashboard-text">
              <div className="dashboard-hot">Delicious Flavors</div>
              <div className="dashboard-spicy">Welcome {currentUser?.name || "Guest"}!</div>
              <div className="dashboard-limited">Order Now & Enjoy</div>
              <button onClick={() => navigate("/menu")} style={{ 
                marginTop: "20px", 
                padding: "10px 20px", 
                background: "var(--red)", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontWeight: "600"
              }}>
                View Full Menu
              </button>
            </div>
          </div>

          <div className="menu-page-welcome-panel">
            <h1 className="menu-page-welcome">Featured Items</h1>
            <p className="menu-page-summary">
              Check out our popular dishes available for order
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <p>Loading featured items...</p>
            </div>
          ) : (
            <div className="menu-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
              {menuItems.map((item) => (
                <div key={item.id} className={`menu-card ${selectedItemId === item.id ? "menu-card-active" : ""}`}>
                  <div className="menu-card-title">
                    <h4>{item.name}</h4>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="menu-card-footer">
                    <span>{item.category}</span>
                    <button 
                      className="menu-add-btn" 
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
