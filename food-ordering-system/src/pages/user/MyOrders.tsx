import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import "./MyOrders.css";
import type { Order } from "../../types";
import { apiUrl } from "../../config/api";
import { getStoredItem } from "../../utils/storage";
import { addReview, getReviews } from "../../services/api";

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
const getOrderTime = (order: Order) =>
  new Date(order.createdAt || order.updatedAt || 0).getTime() || 0;

type OrderItem = Order["items"][number];
type OrderModalMode = "details" | "reviews";

type CurrentUser = {
  id: string;
  name?: string;
  email?: string;
};

type ReviewLike = {
  id?: string;
  _id?: string;
  reviewId?: string;
  review_id?: string;
  orderId?: string;
  order_id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  user_id?: string;
  foodItemId?: string;
  food_item_id?: string;
  itemId?: string;
  item_id?: string;
  productId?: string;
  product_id?: string;
  foodItemName?: string;
  food_item_name?: string;
  itemName?: string;
  item_name?: string;
  productName?: string;
  product_name?: string;
  rating?: number | string;
  comment?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  hidden?: boolean;
};

const readText = (...values: Array<unknown>) => {
  const value = values.find((entry) => entry !== undefined && entry !== null);
  return value === undefined || value === null ? "" : String(value);
};

const readReviewOrderId = (review?: ReviewLike | null) =>
  review ? readText(review.orderId, review.order_id) : "";

const readReviewCustomerId = (review?: ReviewLike | null) =>
  review
    ? readText(
        review.customerId,
        review.customer_id,
        review.userId,
        review.user_id,
      )
    : "";

const readReviewItemId = (review?: ReviewLike | null) =>
  review
    ? readText(
        review.foodItemId,
        review.food_item_id,
        review.itemId,
        review.item_id,
        review.productId,
        review.product_id,
      )
    : "";

const readReviewItemName = (review?: ReviewLike | null) =>
  review
    ? readText(
        review.foodItemName,
        review.food_item_name,
        review.itemName,
        review.item_name,
        review.productName,
        review.product_name,
      )
    : "";

const readReviewComment = (review?: ReviewLike | null) =>
  review?.comment?.trim() || "";

const readReviewRating = (review?: ReviewLike | null) => {
  const rating = Number(review?.rating);
  return Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 0;
};

const getReviewList = (response: unknown): ReviewLike[] => {
  if (Array.isArray(response)) return response as ReviewLike[];
  if (response && typeof response === "object") {
    const record = response as {
      data?: unknown;
      reviews?: unknown;
      items?: unknown;
    };
    if (Array.isArray(record.data)) return record.data as ReviewLike[];
    if (Array.isArray(record.reviews)) return record.reviews as ReviewLike[];
    if (Array.isArray(record.items)) return record.items as ReviewLike[];
  }
  return [];
};

const getItemName = (item: OrderItem) => displayValue(item.name).toLowerCase();

const isMatchingReview = (
  review: ReviewLike,
  order: Order,
  item: OrderItem,
) => {
  if (review.hidden) return false;

  const sameOrder = readReviewOrderId(review) === order.id;
  const reviewItemId = readReviewItemId(review);
  const sameItem = reviewItemId
    ? reviewItemId === item.id
    : readReviewItemName(review).toLowerCase() === getItemName(item);
  const reviewCustomerId = readReviewCustomerId(review);
  const sameCustomer =
    !reviewCustomerId ||
    !order.customerId ||
    reviewCustomerId === order.customerId;

  return sameOrder && sameItem && sameCustomer;
};

const findItemReview = (
  reviews: ReviewLike[],
  order: Order,
  item: OrderItem,
) => reviews.find((review) => isMatchingReview(review, order, item));

const isOrderFullyReviewed = (reviews: ReviewLike[], order: Order) => {
  const orderItems = order.items ?? [];
  return (
    order.status === "Delivered" &&
    orderItems.length > 0 &&
    orderItems.every((item) => findItemReview(reviews, order, item))
  );
};

const renderStars = (rating: number) => {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(normalizedRating)}${"☆".repeat(5 - normalizedRating)}`;
};

const getCurrentUser = (): CurrentUser | null => {
  const user = getStoredItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser] = useState<CurrentUser | null>(() => getCurrentUser());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderMode, setSelectedOrderMode] =
    useState<OrderModalMode>("details");
  const [reviews, setReviews] = useState<ReviewLike[]>([]);
  const navigate = useNavigate();
  const previousStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const fetchOrders = async (userId: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(apiUrl("/orders"));
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      // Filter orders for current customer
      const customerOrders = data.filter(
        (order: Order) => order.customerId === userId,
      );

      // Notify on status changes (poll-friendly)
      const prev = previousStatusRef.current;
      for (const o of customerOrders) {
        const prevStatus = prev[o.id];
        if (prevStatus && prevStatus !== o.status) {
          setToastMessage(`Order ${o.id.slice(0, 8)} is now ${o.status}.`);
          break;
        }
      }
      previousStatusRef.current = Object.fromEntries(
        customerOrders.map((o: Order) => [o.id, o.status]),
      );

      setOrders(customerOrders);
    } catch (err) {
      setOrders([]);
      setError(
        err instanceof Error ? err.message : "Failed to load your orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await getReviews();
      setReviews(getReviewList(response));
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser?.id) {
      const initialLoad = window.setTimeout(() => {
        fetchOrders(currentUser.id);
        fetchReviews();
      }, 0);
      // Refresh orders every 5 seconds to show updated status
      const interval = window.setInterval(() => {
        fetchOrders(currentUser.id);
      }, 5000);
      return () => {
        window.clearTimeout(initialLoad);
        window.clearInterval(interval);
      };
    }
  }, [currentUser]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search by ordered item name
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((order) =>
        (order.items ?? []).some((item) => getItemName(item).includes(query)),
      );
    }

    // Status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    return [...filtered].sort((a, b) => getOrderTime(b) - getOrderTime(a));
  }, [orders, searchQuery, selectedStatus]);

  const openOrderModal = (order: Order, mode: OrderModalMode) => {
    setSelectedOrder(order);
    setSelectedOrderMode(mode);
  };

  const handleReviewSaved = (review: ReviewLike) => {
    setReviews((prev) => [...prev, review]);
  };

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
          {toastMessage && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: "#e8f5e9",
                color: "#2e7d32",
                fontWeight: 600,
              }}
            >
              {toastMessage}
            </div>
          )}
          <h1 className="my-orders-title">My Orders</h1>

          {/* Search and Filter */}
          <div className="my-orders-controls">
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          ) : error ? (
            <div className="my-orders-empty">
              <h2>Couldn’t load orders</h2>
              <p>{error}</p>
              <button
                onClick={() => currentUser?.id && fetchOrders(currentUser.id)}
                className="my-orders-action-btn"
              >
                Try Again
              </button>
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
                const canReviewOrder =
                  order.status === "Delivered" &&
                  orderItems.length > 0 &&
                  !isOrderFullyReviewed(reviews, order);

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
                        <p className="order-total">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="order-card-details">
                      <p>
                        <span>Deliver to:</span>{" "}
                        {displayValue(order.customerAddress)}
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
                          <span className="item-tag muted">
                            No item details
                          </span>
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

                    <div className="order-card-actions">
                      {canReviewOrder && (
                        <button
                          onClick={() => openOrderModal(order, "reviews")}
                          className="order-review-btn"
                        >
                          Review Items
                        </button>
                      )}
                      <button
                        onClick={() => openOrderModal(order, "details")}
                        className="order-view-btn"
                      >
                        View Details
                      </button>
                    </div>
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
          mode={selectedOrderMode}
          reviews={reviews}
          onReviewSaved={handleReviewSaved}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

function OrderDetailsModal({
  order,
  mode,
  reviews,
  onReviewSaved,
  onClose,
}: {
  order: Order;
  mode: OrderModalMode;
  reviews: ReviewLike[];
  onReviewSaved: (review: ReviewLike) => void;
  onClose: () => void;
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const navigate = useNavigate();
  const orderItems = order.items ?? [];
  const canReview = order.status === "Delivered";
  const isReviewMode = mode === "reviews";

  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  const findExistingReview = (item: OrderItem) =>
    findItemReview(reviews, order, item);

  const startReview = (item: OrderItem) => {
    if (findExistingReview(item)) {
      setReviewSuccess("This item has already been reviewed.");
      return;
    }

    setReviewingItem(item);
    setRating(5);
    setComment("");
    setReviewError("");
    setReviewSuccess("");
  };

  const closeReview = () => {
    setReviewingItem(null);
    setReviewError("");
  };

  const handleSubmitReview = async () => {
    if (!reviewingItem) return;

    const cleanComment = comment.trim();
    if (!cleanComment) {
      setReviewError("Please write a short review comment.");
      return;
    }

    if (cleanComment.length > 180) {
      setReviewError("Please keep your review under 180 characters.");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    try {
      if (findExistingReview(reviewingItem)) {
        setReviewingItem(null);
        setReviewSuccess("This item has already been reviewed.");
        return;
      }

      const now = new Date().toISOString();
      const reviewPayload = {
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        foodItemId: reviewingItem.id,
        foodItemName: reviewingItem.name,
        rating,
        comment: cleanComment,
        createdAt: now,
        updatedAt: now,
        hidden: false,
      };

      const createdReview = await addReview(reviewPayload);
      onReviewSaved({
        ...reviewPayload,
        ...createdReview,
      });
      setReviewSuccess("Thanks! Your review was submitted.");

      setReviewingItem(null);
      setComment("");
      setRating(5);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to save review.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!["Pending", "Preparing"].includes(order.status)) return;

    setCancelLoading(true);
    setCancelError("");
    try {
      const res = await fetch(apiUrl(`/orders/${order.id}`), {
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
      setCancelError(
        err instanceof Error ? err.message : "Failed to cancel order.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="order-details-modal">
        <div className="modal-header">
          <h2>{isReviewMode ? "Review Items" : "Order Details"}</h2>
          <button onClick={onClose} className="modal-close">
            X
          </button>
        </div>

        <div className="modal-content">
          {!isReviewMode && (
            <>
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
            </>
          )}

          <div className="detail-section">
            <h3>{isReviewMode ? "Item Reviews" : "Items Ordered"}</h3>
            {orderItems.length === 0 ? (
              <p className="detail-placeholder">No item details available.</p>
            ) : (
              orderItems.map((item, idx) => {
                const existingReview = findExistingReview(item);
                const reviewRating = readReviewRating(existingReview);
                const reviewComment = readReviewComment(existingReview);

                return (
                  <div
                    key={idx}
                    className={`order-item ${isReviewMode ? "review-only-item" : ""}`}
                  >
                    <div className="item-info">
                      <h4>{displayValue(item.name)}</h4>
                      {!isReviewMode && (
                        <p>
                          Qty: {item.quantity ?? 0} x {formatPrice(item.price)}
                        </p>
                      )}
                      {existingReview ? (
                        <div className="submitted-review">
                          <span className="review-status-pill">Reviewed</span>
                          <p className="submitted-review-rating">
                            {renderStars(reviewRating)}{" "}
                            <span>{reviewRating}/5</span>
                          </p>
                          <p className="submitted-review-comment">
                            {reviewComment || "No comment provided."}
                          </p>
                        </div>
                      ) : canReview ? (
                        <button
                          type="button"
                          className="item-review-btn"
                          onClick={() => startReview(item)}
                        >
                          Write a Review
                        </button>
                      ) : (
                        <p className="review-unavailable">
                          Reviews open after delivery.
                        </p>
                      )}
                    </div>
                    {!isReviewMode && (
                      <span className="item-subtotal">
                        {formatPrice((item.price ?? 0) * (item.quantity ?? 0))}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {reviewSuccess && (
            <p className="review-success-message">{reviewSuccess}</p>
          )}

          {reviewingItem && (
            <div className="review-form-panel">
              <div className="review-form-header">
                <div>
                  <p>{displayValue(reviewingItem.name)}</p>
                  <h3>Write Review</h3>
                </div>
                <button type="button" onClick={closeReview}>
                  X
                </button>
              </div>

              <div className="star-rating-control" aria-label="Select rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "star active" : "star"}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={180}
                placeholder="Write a short review..."
                className="review-comment-input"
              />

              <div className="review-form-footer">
                <span>{comment.trim().length}/180</span>
                <button
                  type="button"
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
              {reviewError && <p className="review-error">{reviewError}</p>}
            </div>
          )}

          {!isReviewMode && (
            <>
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
                  {cancelError && (
                    <p style={{ color: "#d32f2f", marginTop: 8 }}>
                      {cancelError}
                    </p>
                  )}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
