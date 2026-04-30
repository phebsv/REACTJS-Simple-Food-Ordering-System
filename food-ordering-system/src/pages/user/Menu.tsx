import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import "./Dashboard.css";
import "./Menu.css";

import type { FoodItem } from "../types";

type MenuItemProps = {
  items: FoodItem[];
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onAddToCart: (item: FoodItem) => void;
  selectedItemId: string | null;
};

function MenuList({ items, categories, selectedCategories, onCategoryToggle, onAddToCart, selectedItemId }: MenuItemProps) {
  return (
    <section className="menu-section">
      <div className="menu-header">
        <div>
          <span className="menu-highlight">Highlighted Menu</span>
          <h2>Choose your favorite food</h2>
          <p>Select a category and add items to your cart.</p>
        </div>
      </div>

      <div className="menu-filter-panel">
        <h3>Filter by category</h3>
        <div className="menu-filter-options">
          {categories.map((category) => (
            <label key={category} className="menu-filter-label">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryToggle(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="menu-grid">
        {items.map((item) => (
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
                onClick={() => onAddToCart(item)}
                disabled={item.available === false}
                title={item.available === false ? "Item unavailable" : ""}
              >
                {item.available === false ? "Unavailable" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Menu() {
  const [allMenuItems, setAllMenuItems] = useState<FoodItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        
        // Filter out unavailable items
        const availableItems = data.filter((item: FoodItem) => item.available !== false);
        setAllMenuItems(availableItems);
        
        // Extract unique categories and set as selected by default
        const uniqueCategories = [...new Set(availableItems.map((item: FoodItem) => item.category))] as string[];
        setSelectedCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load menu");
        // Fallback to empty menu if API fails
        setAllMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const handleAddToCart = (item: FoodItem) => {
    addItem(item);
    setSelectedItemId(item.id);
  };

  const visibleMenuItems = allMenuItems.filter(
    (item) => selectedCategories.length === 0 || selectedCategories.includes(item.category)
  );

  const uniqueCategories = [...new Set(allMenuItems.map((item) => item.category))];

  return (
    <>
      <Navbar title="MENU" showNavLinks={true} />
      <div className="menu-page-container">
        <div className="menu-page-intro">
          <div className="menu-page-top">
            <div className="menu-page-hot">fresh flavors</div>
            <div className="menu-page-meal">choose your meal</div>
            <div className="menu-page-tagline">add to cart and check your order</div>
          </div>
          <div className="menu-page-welcome-panel">
            <h1 className="menu-page-welcome">Food Menu</h1>
            <p className="menu-page-summary">
              Browse the food categories and tap Add to Cart on each item to build your order.
            </p>
          </div>
        </div>

        <div className="menu-page-grid">
          <div className="menu-main">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>Loading menu...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
                <p>Error: {error}</p>
              </div>
            ) : allMenuItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>No items available</p>
              </div>
            ) : (
              <MenuList
                items={visibleMenuItems}
                categories={uniqueCategories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                onAddToCart={handleAddToCart}
                selectedItemId={selectedItemId}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
