import { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminModal from "../../components/admin/AdminModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import { useAdmin } from "../../context/AdminContext";
import type { Review } from "../../interfaces";
import "./AdminReviews.css";

type RatingFilter = "All" | 5 | 4 | 3 | 2 | 1;

export default function AdminReviews() {
  const {
    reviews,
    fetchReviews,
    hideReview,
    deleteReview,
    loading,
    error,
    setError,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("All");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    reviewId?: string;
    action?: "hide" | "delete";
  }>({ isOpen: false });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  // ==================== FILTERING ====================
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.foodItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.orderId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        ratingFilter === "All" || review.rating === ratingFilter;
      const notHidden = !review.hidden;

      return matchesSearch && matchesRating && notHidden;
    });
  }, [reviews, searchQuery, ratingFilter]);

  // ==================== HANDLERS ====================
  const handleOpenDetails = (review: Review) => {
    setSelectedReview(review);
    setIsDetailsOpen(true);
  };

  const handleHideClick = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      reviewId,
      action: "hide",
    });
  };

  const handleDeleteClick = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      reviewId,
      action: "delete",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.reviewId) return;

    try {
      setActionLoading(true);
      if (confirmDialog.action === "hide") {
        await hideReview(confirmDialog.reviewId);
        if (selectedReview?.id === confirmDialog.reviewId) {
          setIsDetailsOpen(false);
        }
      } else if (confirmDialog.action === "delete") {
        await deleteReview(confirmDialog.reviewId);
        if (selectedReview?.id === confirmDialog.reviewId) {
          setIsDetailsOpen(false);
        }
      }
      setConfirmDialog({ isOpen: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const ratingFilters: RatingFilter[] = ["All", 5, 4, 3, 2, 1];
  const totalHiddenReviews = reviews.filter((r) => r.hidden).length;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        {/* ==================== HEADER ==================== */}
        <div className="admin-header">
          <h1>Reviews Management</h1>
          <p className="admin-subtitle">Monitor and manage customer reviews</p>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        {totalHiddenReviews > 0 && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            {totalHiddenReviews} review(s) are hidden
          </div>
        )}

        {/* ==================== SEARCH BAR ==================== */}
        <div className="reviews-search-bar">
          <input
            type="text"
            placeholder="Search by customer name, food item, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* ==================== RATING FILTER ==================== */}
        <div className="rating-filter">
          <span className="filter-label">Filter by Rating:</span>
          <div className="rating-tabs">
            {ratingFilters.map((rating) => (
              <button
                key={rating}
                className={`rating-tab ${ratingFilter === rating ? "active" : ""}`}
                onClick={() => setRatingFilter(rating)}
              >
                {rating === "All" ? "All" : `${rating}Γ¡É`}
                <span className="tab-count">
                  {rating === "All"
                    ? reviews.filter((r) => !r.hidden).length
                    : reviews.filter((r) => r.rating === rating && !r.hidden)
                        .length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== REVIEWS LIST ==================== */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state">No reviews found</p>
          </div>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-customer">
                    <h3>{review.customerName}</h3>
                    <p className="review-meta">
                      Order #{review.orderId.slice(0, 8)}
                    </p>
                  </div>
                  <div className="review-rating">
                    <RatingStars rating={review.rating} />
                    <span className="rating-value">{review.rating}</span>
                  </div>
                </div>

                <div className="review-food-item">
                  <strong>Food Item:</strong> {review.foodItemName}
                </div>

                <p className="review-comment">{review.comment}</p>

                <div className="review-footer">
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <div className="review-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleOpenDetails(review)}
                    >
                      View
                    </button>
                    <button
                      className="action-btn hide-btn"
                      onClick={() => handleHideClick(review.id)}
                    >
                      Hide
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== REVIEW DETAILS MODAL ==================== */}
        {selectedReview && (
          <AdminModal
            isOpen={isDetailsOpen}
            title="Review Details"
            onClose={() => setIsDetailsOpen(false)}
            size="medium"
          >
            <div className="review-details">
              <div className="details-section">
                <h3>Customer Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Customer Name</label>
                    <p>{selectedReview.customerName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Order ID</label>
                    <p>#{selectedReview.orderId.slice(0, 8)}</p>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Review Content</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Food Item</label>
                    <p>{selectedReview.foodItemName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Rating</label>
                    <div className="review-rating-display">
                      <RatingStars rating={selectedReview.rating} />
                      <span>{selectedReview.rating}/5</span>
                    </div>
                  </div>
                </div>

                <div className="detail-item full-width">
                  <label>Review Comment</label>
                  <p className="review-comment-text">
                    {selectedReview.comment}
                  </p>
                </div>
              </div>

              <div className="details-section">
                <h3>Review Date</h3>
                <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
              </div>

              <div className="details-actions">
                <button
                  className="action-btn hide-btn"
                  onClick={() => handleHideClick(selectedReview.id)}
                >
                  ≡ƒÖê Hide Review
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteClick(selectedReview.id)}
                >
                  ≡ƒùæ∩╕Å Delete Review
                </button>
              </div>
            </div>
          </AdminModal>
        )}

        {/* ==================== CONFIRM DIALOG ==================== */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={
            confirmDialog.action === "delete"
              ? "Delete Review?"
              : "Hide Review?"
          }
          message={
            confirmDialog.action === "delete"
              ? "Are you sure you want to delete this review? This action cannot be undone."
              : "This review will be hidden from public view."
          }
          confirmText={confirmDialog.action === "delete" ? "Delete" : "Hide"}
          isDangerous={confirmDialog.action === "delete"}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialog({ isOpen: false })}
          isLoading={actionLoading}
        />
      </div>
    </div>
  );
}

// ==================== RATING STARS COMPONENT ====================
function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="rating-stars">
      {"Γ¡É".repeat(rating)}
      {"Γÿå".repeat(5 - rating)}
    </span>
  );
}
