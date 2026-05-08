import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

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
                      {item.image && (
                        <div className="cart-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                      )}

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
                          >
                            LESS
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="qty-btn"
                          >
                            MORE
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
