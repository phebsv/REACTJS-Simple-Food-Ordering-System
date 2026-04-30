import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import "./Checkout.css";

export default function Checkout() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      setName(userData.name || "");
      setPhone(userData.phone || "");
      setAddress(userData.address || "");
    }
  }, []);

  const handleCheckout = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!address.trim()) {
      setError("Delivery address is required");
      return;
    }
    if (items.length === 0) {
      setError("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const newOrder = {
        id: `order${Date.now()}`,
        customerId: currentUser?.id || "guest",
        customerName: name,
        customerEmail: currentUser?.email || "",
        customerPhone: phone,
        customerAddress: address,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          quantity: item.quantity
        })),
        subtotal: parseFloat(total.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: "Pending",
        paymentMethod,
        deliveryNotes: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const res = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });

      if (!res.ok) throw new Error("Failed to place order");

      clearCart();
      navigate("/my-orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="CHECKOUT" showNavLinks={true} />
      <div className="checkout-container">
        <div className="checkout-content">
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-grid">
            {/* Form Section */}
            <div className="checkout-form-section">
              <h2>Delivery Information</h2>

              <div className="checkout-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="checkout-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="checkout-form-group">
                <label>Delivery Address *</label>
                <textarea
                  placeholder="Enter your delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="checkout-form-group">
                <label>Special Instructions (Optional)</label>
                <textarea
                  placeholder="Any special requests or delivery notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  rows={2}
                />
              </div>

              <div className="checkout-form-group">
                <label>Payment Method *</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={loading}>
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>

              {error && <div className="checkout-error">{error}</div>}

              <button 
                onClick={handleCheckout} 
                disabled={loading || items.length === 0}
                className="checkout-btn"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>

            {/* Summary Section */}
            <div className="checkout-summary-section">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {items.length === 0 ? (
                  <p className="summary-empty">Your cart is empty</p>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.id} className="summary-item">
                        <div className="summary-item-info">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <div className="summary-item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row summary-row-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
