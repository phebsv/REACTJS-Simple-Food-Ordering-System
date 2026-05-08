import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import "./Checkout.css";
import { apiUrl } from "../../config/api";
import { getStoredItem } from "../../utils/storage";

export default function Checkout() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  useEffect(() => {
    const user = getStoredItem("currentUser");
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
    setFieldErrors({});

    const nextFieldErrors: Record<string, string> = {};
    const phoneDigits = phone.replace(/\D/g, "");

    if (name.trim().length < 2) {
      nextFieldErrors.name = "Enter your full name.";
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      nextFieldErrors.phone = "Enter a valid 10 or 11 digit phone number.";
    }
    if (address.trim().length < 10) {
      nextFieldErrors.address = "Enter a complete delivery address.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Please check the highlighted delivery details.");
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

      const res = await fetch(apiUrl("/orders"), {
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

              <div className="form-section-group">
                <h3 className="form-section-title">Customer Details</h3>
                <p className="form-section-helper">Use the name and mobile number the rider can confirm on delivery.</p>
                <div className="checkout-form-group">
                  <label htmlFor="checkout-name">Full Name *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    autoComplete="name"
                    aria-invalid={!!fieldErrors.name}
                  />
                  {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="checkout-phone">Mobile Number *</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    placeholder="0917 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={!!fieldErrors.phone}
                  />
                  {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div className="form-section-group">
                <h3 className="form-section-title">Delivery Address</h3>
                <p className="form-section-helper">Include house number, street, barangay, city, and any nearby landmark.</p>
                <div className="checkout-form-group">
                  <label htmlFor="checkout-address">Complete Address *</label>
                  <textarea
                    id="checkout-address"
                    placeholder="House / unit no., street, barangay, city"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    rows={3}
                    autoComplete="street-address"
                    aria-invalid={!!fieldErrors.address}
                  />
                  {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="checkout-notes">Delivery Notes (Optional)</label>
                  <textarea
                    id="checkout-notes"
                    placeholder="Gate code, landmark, or food preparation request"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    rows={2}
                  />
                </div>
              </div>

              <div className="form-section-group">
                <h3 className="form-section-title">Payment</h3>
                <div className="checkout-form-group">
                  <label htmlFor="checkout-payment">Payment Method *</label>
                  <select id="checkout-payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={loading}>
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="cash">Cash on Delivery</option>
                  </select>
                </div>
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
                          ₱{(item.price * item.quantity).toFixed(2)}
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
                  <span>₱{total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row summary-row-total">
                  <span>Total:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
