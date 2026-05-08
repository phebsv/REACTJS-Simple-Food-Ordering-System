import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import { useCart } from "../../context/CartContext";
import { decodeHtmlEntities, formatPricePHP, formatRating } from "../../utils/textHelpers";
import "./Dashboard.css";
import "./Menu.css";
import { apiUrl } from "../../config/api";

import type { FoodItem } from "../../types";

// Fallback image
const FALLBACK_FOOD_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23F5EFE0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%23888080' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

type MenuItemProps = {
  items: FoodItem[];
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onAddToCart: (item: FoodItem) => void;
  selectedItemId: string | null;
  onToastShow?: (message: string) => void;
};

function MenuList({
  items,
  categories,
  selectedCategories,
  onCategoryToggle,
  onAddToCart,
  selectedItemId,
  onToastShow,
}: MenuItemProps) {
  const handleAddClick = (item: FoodItem) => {
    onAddToCart(item);
    onToastShow?.(`${decodeHtmlEntities(item.name)} added to cart!`);
  };

  return (
    <section className="menu-section">
      <div className="menu-header">
        <div>
          <span className="menu-highlight">Highlighted Menu</span>
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
          <div
            key={item.id}
            className={`menu-card ${selectedItemId === item.id ? "menu-card-active" : ""}`}
          >
            <div className="menu-card-image-container">
              <img
                src={item.image || FALLBACK_FOOD_IMAGE}
                alt={decodeHtmlEntities(item.name)}
                className="menu-card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                }}
              />
            </div>
            <div className="menu-card-content">
              <div className="menu-card-title">
                <h4>{decodeHtmlEntities(item.name)}</h4>
                <span className="menu-card-price">{formatPricePHP(item.price)}</span>
              </div>
              <p className="menu-card-description">{item.description}</p>
              <div className="menu-card-rating">
                {formatRating(0, 0)}
              </div>
              <div className="menu-card-footer">
                <span className="menu-card-category">{item.category}</span>
                <button
                  className="menu-add-btn"
                  onClick={() => handleAddClick(item)}
                  disabled={item.available === false}
                  title={item.available === false ? "Item unavailable" : ""}
                >
                  {item.available === false ? "Unavailable" : "Add to Cart"}
                </button>
              </div>
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { addItem } = useCart();

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/menu"));
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();

        // Filter out unavailable items
        const availableItems = data.filter(
          (item: FoodItem) => item.available !== false,
        );
        setAllMenuItems(availableItems);

        // Extract unique categories and set as selected by default
        const uniqueCategories = [
          ...new Set(availableItems.map((item: FoodItem) => item.category)),
        ] as string[];
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
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const handleAddToCart = (item: FoodItem) => {
    addItem(item);
    setSelectedItemId(item.id);
  };

  const visibleMenuItems = allMenuItems.filter(
    (item) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category),
  );

  const uniqueCategories = [
    ...new Set(allMenuItems.map((item) => item.category)),
  ];

  // Get a featured item for hero banner
  const featuredItem = allMenuItems.length > 0 ? allMenuItems[0] : null;

  return (
    <>
      <Navbar title="MENU" showNavLinks={true} />
      <div className="menu-page-container">
        <BgFood />
        {/* Toast Notification */}
        {toastMessage && (
          <div className="menu-toast">
            Success: {toastMessage}
          </div>
        )}

        {/* Hero Banner */}
        {featuredItem && (
          <div className="menu-hero-banner">
            <div className="menu-hero-content">
              <div className="menu-hero-text">
                <div className="menu-hero-label">Try our best</div>
                <h2 className="menu-hero-title">{decodeHtmlEntities(featuredItem.name)}</h2>
                <div className="menu-hero-price">{formatPricePHP(featuredItem.price)}</div>
                <button
                  className="menu-hero-btn"
                  onClick={() => {
                    handleAddToCart(featuredItem);
                    setToastMessage(`${decodeHtmlEntities(featuredItem.name)} added to cart!`);
                  }}
                >
                  Order Now
                </button>
              </div>
              <div className="menu-hero-image">
                <img
                  src={featuredItem.image || FALLBACK_FOOD_IMAGE}
                  alt={decodeHtmlEntities(featuredItem.name)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="menu-page-grid">
          <div className="menu-main">
            {loading ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>Loading menu...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#d32f2f",
                }}
              >
                <p>Error: {error}</p>
              </div>
            ) : allMenuItems.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
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
                onToastShow={setToastMessage}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
