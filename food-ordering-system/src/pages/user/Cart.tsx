import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

const FALLBACK_FOOD_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23FAE8E8' width='200' height='200'/%3E%3Ccircle cx='100' cy='86' r='38' fill='%23F5EFE0' stroke='%23C8000A' stroke-width='6'/%3E%3Cpath d='M65 134h70' stroke='%23C8000A' stroke-width='8' stroke-linecap='round'/%3E%3Ctext x='50%25' y='168' font-size='16' font-family='Arial, sans-serif' font-weight='700' fill='%23888080' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  return (
    <>
      <Navbar title="CART" showNavLinks={true} />
      <div className="cart-page-container">
        <BgFood />
        <div className="cart-page-content">
          <h1 className="cart-page-title">Shopping Cart</h1>

          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-section">
              {items.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">EMPTY CART</div>
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
                  {items.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-image">
                        <img
                          src={item.image || FALLBACK_FOOD_IMAGE}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              FALLBACK_FOOD_IMAGE;
                          }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-description">
                          {item.description}
                        </p>
                        <p className="cart-item-price">
                          ₱{item.price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="cart-item-controls">
                        <div className="quantity-selector">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="qty-btn"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            -
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="qty-btn"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-subtotal">
                          ₱{(item.price * item.quantity).toFixed(2)}
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
            {items.length > 0 && (
              <div className="cart-summary-section">
                <div className="cart-summary-card">
                  <h2>Order Summary</h2>

                  <div className="summary-items">
                    {items.map((item) => (
                      <div key={item.id} className="summary-row">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Total:</span>
                    <span className="total-amount">₱{total.toFixed(2)}</span>
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
