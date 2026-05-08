import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import "./MyOrders.css";
import type { Order } from "../../types";

const ORDER_STATUSES = [
  "All",
  "Pending",
  "Preparing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const formatPrice = (value?: number) => `₱${(value ?? 0).toFixed(2)}`;
const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "No date available";
const displayValue = (value?: string) => value || "Not provided";

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();

        // Filter orders for current customer
        const customerOrders = data.filter(
          (order: Order) => order.customerId === currentUser?.id,
        );
        setOrders(customerOrders);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchOrders();
    }
  }, [currentUser]);

  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchId.trim()) {
      filtered = filtered.filter((order) =>
        order.id.toLowerCase().includes(searchId.toLowerCase()),
      );
    }

    // Status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchId, selectedStatus]);

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#FFC107";
      case "Preparing":
        return "#2196F3";
      case "Ready":
        return "#4CAF50";
      case "Delivered":
        return "#4CAF50";
      case "Cancelled":
        return "#F44336";
      default:
        return "#999";
    }
  };

  return (
    <>
      <Navbar title="MY ORDERS" showNavLinks={true} />
      <div className="my-orders-container">
        <BgFood />
        <div className="my-orders-content">
          <h1 className="my-orders-title">My Orders</h1>

          {/* Search and Filter */}
          <div className="my-orders-controls">
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="my-orders-search"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="my-orders-filters">
            {ORDER_STATUSES.map((status) => {
              const count = orders.filter((o) =>
                status === "All" ? true : o.status === status,
              ).length;
              return (
                <button
                  key={status}
                  className={`filter-tab ${selectedStatus === status ? "active" : ""}`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                  {count > 0 && <span className="filter-count">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <p>Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="my-orders-empty">
              <h2>No orders found</h2>
              <p>Your orders will appear here after checkout.</p>
              <button
                onClick={() => navigate("/menu")}
                className="my-orders-action-btn"
              >
                Start Ordering
              </button>
            </div>
          ) : (
            <div className="my-orders-list">
              {filteredOrders.map((order) => {
                const orderItems = order.items ?? [];

                return (
                  <div key={order.id} className="my-orders-card">
                    <div className="order-card-header">
                      <div className="order-card-id">
                        <h3>{displayValue(order.id)}</h3>
                        <span
                          style={{
                            color: statusBadgeColor(order.status),
                            fontWeight: "600",
                          }}
                        >
                          {displayValue(order.status)}
                        </span>
                      </div>
                      <div className="order-card-meta">
                        <p className="order-date">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="order-total">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    <div className="order-card-details">
                      <p>
                        <span>Deliver to:</span> {displayValue(order.customerAddress)}
                      </p>
                      <p>
                        <span>Payment:</span>{" "}
                        {displayValue(order.paymentMethod?.replace("-", " "))}
                      </p>
                    </div>

                    <div className="order-card-items">
                      <p className="order-items-count">
                        {orderItems.length} item
                        {orderItems.length !== 1 ? "s" : ""}
                      </p>
                      <div className="order-items-preview">
                        {orderItems.length === 0 ? (
                          <span className="item-tag muted">No item details</span>
                        ) : (
                          <>
                            {orderItems.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="item-tag">
                                {displayValue(item.name)} x{item.quantity ?? 0}
                              </span>
                            ))}
                            {orderItems.length > 2 && (
                              <span className="item-tag">
                                +{orderItems.length - 2} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="order-view-btn"
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const navigate = useNavigate();
  const orderItems = order.items ?? [];

  const handleCancelOrder = async () => {
    if (!["Pending", "Preparing"].includes(order.status)) return;

    setCancelLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Cancelled",
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to cancel order");

      onClose();
      navigate("/my-orders");
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="order-details-modal">
        <div className="modal-header">
          <h2>Order Details</h2>
          <button onClick={onClose} className="modal-close">
            X
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-section">
            <h3>Order Information</h3>
            <div className="detail-row">
              <span>Order ID:</span>
              <span className="detail-value">{displayValue(order.id)}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="detail-value">{displayValue(order.status)}</span>
            </div>
            <div className="detail-row">
              <span>Date:</span>
              <span className="detail-value">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Delivery Information</h3>
            <div className="detail-row">
              <span>Name:</span>
              <span>{displayValue(order.customerName)}</span>
            </div>
            <div className="detail-row">
              <span>Phone:</span>
              <span>{displayValue(order.customerPhone)}</span>
            </div>
            <div className="detail-row">
              <span>Address:</span>
              <span>{displayValue(order.customerAddress)}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Items Ordered</h3>
            {orderItems.length === 0 ? (
              <p className="detail-placeholder">No item details available.</p>
            ) : (
              orderItems.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="item-info">
                    <h4>{displayValue(item.name)}</h4>
                    <p>
                      Qty: {item.quantity ?? 0} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="item-subtotal">
                    {formatPrice((item.price ?? 0) * (item.quantity ?? 0))}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="detail-section">
            <h3>Summary</h3>
            <div className="detail-row">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="detail-row total-row">
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Payment</h3>
            <div className="detail-row">
              <span>Method:</span>
              <span className="capitalize">
                {displayValue(order.paymentMethod?.replace("-", " "))}
              </span>
            </div>
          </div>

          {order.deliveryNotes && (
            <div className="detail-section">
              <h3>Special Instructions</h3>
              <p>{order.deliveryNotes}</p>
            </div>
          )}

          {["Pending", "Preparing"].includes(order.status) && (
            <div className="modal-actions">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="cancel-btn"
                >
                  Cancel Order
                </button>
              ) : (
                <div className="cancel-confirm">
                  <p>Are you sure you want to cancel this order?</p>
                  <div className="confirm-buttons">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelLoading}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelLoading}
                      className="confirm-cancel-btn"
                    >
                      {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
