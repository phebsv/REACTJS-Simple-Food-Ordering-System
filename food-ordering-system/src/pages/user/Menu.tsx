import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import { useCart } from "../../context/CartContext";
import { decodeHtmlEntities, formatPricePHP } from "../../utils/textHelpers";
import "./Dashboard.css";
import "./Menu.css";
import { apiUrl } from "../../config/api";
import { getReviews } from "../../services/api";

import type { FoodItem, Review } from "../../types";

// Fallback image
const FALLBACK_FOOD_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23F5EFE0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%23888080' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

type ReviewSummary = {
  averageRating: number;
  count: number;
};

type ReviewLike = Partial<Review> & {
  food_item_id?: string;
  itemId?: string;
  item_id?: string;
  productId?: string;
  product_id?: string;
  food_item_name?: string;
  itemName?: string;
  item_name?: string;
  productName?: string;
  product_name?: string;
};

type MenuItemProps = {
  items: FoodItem[];
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onAddToCart: (item: FoodItem) => void;
  selectedItemId: string | null;
  reviewSummaries: Record<string, ReviewSummary>;
};

function MenuList({
  items,
  categories,
  selectedCategories,
  onCategoryToggle,
  onAddToCart,
  selectedItemId,
  reviewSummaries,
}: MenuItemProps) {
  const handleAddClick = (item: FoodItem) => {
    onAddToCart(item);
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
        {items.map((item) => {
          const reviewSummary = reviewSummaries[item.id];

          return (
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
                  <span className="menu-card-price">
                    {formatPricePHP(item.price)}
                  </span>
                </div>
                <p className="menu-card-description">{item.description}</p>
                <div className="menu-card-rating">
                  {reviewSummary ? (
                    <>
                      <span className="menu-card-stars" aria-hidden="true">
                        ★
                      </span>
                      <span>{reviewSummary.averageRating.toFixed(1)}</span>
                      <span className="menu-card-review-count">
                        ({reviewSummary.count} review
                        {reviewSummary.count === 1 ? "" : "s"})
                      </span>
                    </>
                  ) : (
                    <span className="menu-card-no-reviews">
                      No reviews yet.
                    </span>
                  )}
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
          );
        })}
      </div>
    </section>
  );
}

function buildReviewSummaries(
  items: FoodItem[],
  reviews: ReviewLike[],
): Record<string, ReviewSummary> {
  const visibleReviews = reviews.filter((review) => !review.hidden);

  return items.reduce<Record<string, ReviewSummary>>((summaries, item) => {
    const normalizedItemName = decodeHtmlEntities(item.name).toLowerCase();
    const itemReviews = visibleReviews.filter((review) => {
      const reviewItemId =
        review.foodItemId ??
        review.food_item_id ??
        review.itemId ??
        review.item_id ??
        review.productId ??
        review.product_id;
      const normalizedReviewName = decodeHtmlEntities(
        review.foodItemName ||
          review.food_item_name ||
          review.itemName ||
          review.item_name ||
          review.productName ||
          review.product_name ||
          "",
      ).toLowerCase();

      return (
        String(reviewItemId) === String(item.id) ||
        normalizedReviewName === normalizedItemName
      );
    });

    if (itemReviews.length === 0) {
      return summaries;
    }

    const totalRating = itemReviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0,
    );

    summaries[item.id] = {
      averageRating: totalRating / itemReviews.length,
      count: itemReviews.length,
    };

    return summaries;
  }, {});
}

function getReviewList(response: unknown): ReviewLike[] {
  if (Array.isArray(response)) return response as ReviewLike[];

  if (response && typeof response === "object") {
    const data = (response as { data?: unknown }).data;
    const reviews = (response as { reviews?: unknown }).reviews;

    if (Array.isArray(data)) return data as ReviewLike[];
    if (Array.isArray(reviews)) return reviews as ReviewLike[];
  }

  return [];
}

export default function Menu() {
  const [allMenuItems, setAllMenuItems] = useState<FoodItem[]>([]);
  const [reviewSummaries, setReviewSummaries] = useState<
    Record<string, ReviewSummary>
  >({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedItem, setAddedItem] = useState<FoodItem | null>(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenu = async (options?: { silent?: boolean }) => {
      const silent = options?.silent;
      try {
        if (!silent) {
          setLoading(true);
        }
        const res = await fetch(apiUrl("/menu"));
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();

        // Filter out unavailable items
        const availableItems = data.filter(
          (item: FoodItem) => item.available !== false,
        );
        setAllMenuItems(availableItems);

        try {
          const reviews = getReviewList(await getReviews());
          setReviewSummaries(buildReviewSummaries(availableItems, reviews));
        } catch {
          setReviewSummaries({});
        }

        // Extract unique categories and set as selected by default
        const uniqueCategories = [
          ...new Set(availableItems.map((item: FoodItem) => item.category)),
        ] as string[];
        if (silent) {
          setSelectedCategories((prev) =>
            prev.length
              ? prev.filter((category) => uniqueCategories.includes(category))
              : uniqueCategories,
          );
        } else {
          setSelectedCategories(uniqueCategories);
          setError(null);
        }
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load menu");
          // Fallback to empty menu if API fails
          setAllMenuItems([]);
          setReviewSummaries({});
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    fetchMenu();
    const interval = window.setInterval(() => {
      fetchMenu({ silent: true });
    }, 5000);
    return () => window.clearInterval(interval);
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
    setAddedItem(item);
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

        {/* Hero Banner */}
        {featuredItem && (
          <div className="menu-hero-banner">
            <div className="menu-hero-content">
              <div className="menu-hero-text">
                <div className="menu-hero-label">Try our best</div>
                <h2 className="menu-hero-title">
                  {decodeHtmlEntities(featuredItem.name)}
                </h2>
                <div className="menu-hero-price">
                  {formatPricePHP(featuredItem.price)}
                </div>
                <button
                  className="menu-hero-btn"
                  onClick={() => {
                    handleAddToCart(featuredItem);
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
                reviewSummaries={reviewSummaries}
              />
            )}
          </div>
        </div>

        {addedItem && (
          <div
            className="menu-add-modal-overlay"
            role="presentation"
            onClick={() => setAddedItem(null)}
          >
            <div
              className="menu-add-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="menu-add-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="menu-add-modal-close"
                onClick={() => setAddedItem(null)}
                aria-label="Close"
              >
                X
              </button>

              <div className="menu-add-modal-image">
                <img
                  src={addedItem.image || FALLBACK_FOOD_IMAGE}
                  alt={decodeHtmlEntities(addedItem.name)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                  }}
                />
              </div>

              <div className="menu-add-modal-content">
                <p className="menu-add-modal-kicker">Added to cart</p>
                <h2 id="menu-add-modal-title">
                  {decodeHtmlEntities(addedItem.name)}
                </h2>
                <p>
                  Your item has been added successfully. You can keep browsing
                  the menu or review your cart when you are ready.
                </p>
              </div>

              <div className="menu-add-modal-actions">
                <button
                  type="button"
                  className="menu-modal-secondary-btn"
                  onClick={() => setAddedItem(null)}
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  className="menu-modal-primary-btn"
                  onClick={() => navigate("/cart")}
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
