import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import "./Cart.css";
import type { FoodItem } from "../types";

interface CartItem extends FoodItem {
  quantity: number;
}

function groupItems(items: FoodItem[]): CartItem[] {
  return items.reduce((acc, item) => {
    const existing = acc.find((entry) => entry.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, [] as CartItem[]);
}

export default function Cart() {
  const { items, removeItem } = useCart();
  const navigate = useNavigate();
  const grouped = groupItems(items);
  const total = grouped.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      const currentItem = grouped.find(item => item.id === itemId);
      if (currentItem) {
        const currentQty = currentItem.quantity;
        if (newQuantity > currentQty) {
          // Add items
          for (let i = currentQty; i < newQuantity; i++) {
            items.push(currentItem);
          }
        } else if (newQuantity < currentQty) {
          // Remove items
          const toRemove = currentQty - newQuantity;
          for (let i = 0; i < toRemove; i++) {
            removeItem(itemId);
          }
        }
      }
    }
  };

  return (
    <>
      <Navbar title="CART" showNavLinks={true} />
      <div className="cart-page-container">
        <div className="cart-page-content">
          <h1 className="cart-page-title">Shopping Cart</h1>

          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-section">
              {grouped.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">≡ƒ¢Æ</div>
                  <h2>Your cart is empty</h2>
                  <p>Add some delicious food items to get started!</p>
                  <button 
                    onClick={() => navigate("/menu")}
                    className="cart-start-btn"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {grouped.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      {item.image && (
                        <div className="cart-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                      )}
                      
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-description">{item.description}</p>
                        <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                      </div>

                      <div className="cart-item-controls">
                        <div className="quantity-selector">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="qty-btn"
                          >
                            ΓêÆ
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-subtotal">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        <button 
                          onClick={() => removeItem(item.id)}
                          className="cart-remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {grouped.length > 0 && (
              <div className="cart-summary-section">
                <div className="cart-summary-card">
                  <h2>Order Summary</h2>

                  <div className="summary-items">
                    {grouped.map((item) => (
                      <div key={item.id} className="summary-row">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Total:</span>
                    <span className="total-amount">${total.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={() => navigate("/checkout")}
                    className="checkout-btn"
                  >
                    Proceed to Checkout
                  </button>

                  <button 
                    onClick={() => navigate("/menu")}
                    className="continue-shopping-btn"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
