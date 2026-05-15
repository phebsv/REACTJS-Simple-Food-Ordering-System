import { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminModal from "../../components/admin/AdminModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import { useAdmin } from "../../context/AdminContext";
import type { AdminOrder, OrderStatus } from "../../interfaces";
import "./AdminOrders.css";

type FilterStatus = OrderStatus | "All";

const PAGE_SIZE = 10;
const FALLBACK_TEXT = "Not provided";

type AdminOrderWithDateFields = AdminOrder & {
  created_at?: string;
  order_date?: string;
  timestamp?: string;
  date?: string;
};

function getOrderTime(order: AdminOrderWithDateFields) {
  const dateValue =
    order.createdAt ??
    order.created_at ??
    order.order_date ??
    order.timestamp ??
    order.date ??
    order.updatedAt;

  return new Date(dateValue || 0).getTime() || 0;
}

function displayValue(value?: string) {
  return value?.trim() || FALLBACK_TEXT;
}

function formatCurrency(value?: number) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

function getOrderItemsPreview(order: AdminOrder) {
  if (!order.items.length) return "Item details unavailable";

  return order.items
    .slice(0, 2)
    .map((item) => `${item.name || "Unnamed item"} x${item.quantity || 0}`)
    .join(", ");
}

export default function AdminOrders() {
  const {
    orders,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    loading,
    error,
    setError,
  } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    orderId?: string;
    action?: "cancel" | "status";
    newStatus?: OrderStatus;
  }>({ isOpen: false });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Debounce search input to avoid heavy filtering on every keystroke
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // ==================== FILTERING ====================
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const query = debouncedSearchQuery.toLowerCase();
        const itemText = order.items
          .map((item) => item.name)
          .join(" ")
          .toLowerCase();
        const matchesSearch =
          !query ||
          order.id.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          itemText.includes(query);

        const matchesStatus =
          filterStatus === "All" || order.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => getOrderTime(b) - getOrderTime(a));
  }, [orders, debouncedSearchQuery, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  // ==================== HANDLERS ====================
  const handleOpenDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setConfirmDialog({
      isOpen: true,
      orderId,
      action: "status",
      newStatus,
    });
  };

  const handleCancelOrder = (orderId: string) => {
    setConfirmDialog({
      isOpen: true,
      orderId,
      action: "cancel",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.orderId) return;

    try {
      setActionLoading(true);
      if (confirmDialog.action === "status" && confirmDialog.newStatus) {
        await updateOrderStatus(confirmDialog.orderId, confirmDialog.newStatus);
        setSelectedOrder(
          orders.find((o) => o.id === confirmDialog.orderId) || null,
        );
      } else if (confirmDialog.action === "cancel") {
        await cancelOrder(confirmDialog.orderId);
        if (selectedOrder?.id === confirmDialog.orderId) {
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

  const statusTabs: FilterStatus[] = [
    "All",
    "Pending",
    "Preparing",
    "Ready",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader
          title="Orders Management"
          subtitle="Manage and track all customer orders"
        />

        {error && <div className="admin-error-banner">{error}</div>}

        {/* ==================== SEARCH BAR ==================== */}
        <div className="orders-search-bar">
          <div className="admin-search-control">
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <button
              type="button"
              className="admin-search-button"
              aria-label="Search orders"
            />
          </div>
        </div>

        {/* ==================== STATUS TABS ==================== */}
        <div className="status-tabs">
          {statusTabs.map((status) => (
            <button
              key={status}
              className={`tab ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
              <span className="tab-count">
                {status === "All"
                  ? orders.length
                  : orders.filter((o) => o.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* ==================== ORDERS TABLE ==================== */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state">No orders found</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date/Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{displayValue(order.id)}</td>
                    <td>
                      <div className="customer-info">
                        <div>{displayValue(order.customerName)}</div>
                        <div className="customer-email">
                          {displayValue(order.customerEmail)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="order-items-summary">
                        <span>{getOrderItemsPreview(order)}</span>
                        {order.items.length > 2 && (
                          <span className="order-items-more">
                            +{order.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="order-total">{formatCurrency(order.total)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="order-datetime">
                      {getOrderTime(order) ? (
                        <>
                          {new Date(order.createdAt).toLocaleDateString()} <br />
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </>
                      ) : (
                        FALLBACK_TEXT
                      )}
                    </td>
                    <td>
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleOpenDetails(order)}
                        title="View Details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="orders-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== ORDER DETAILS MODAL ==================== */}
        {selectedOrder && (
          <AdminModal
            isOpen={isDetailsOpen}
            title={`Order #${displayValue(selectedOrder.id)}`}
            onClose={() => setIsDetailsOpen(false)}
            size="large"
          >
            <div className="order-details">
              <div className="details-section">
                <h3>Customer Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <p>{displayValue(selectedOrder.customerName)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{displayValue(selectedOrder.customerEmail)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{displayValue(selectedOrder.customerPhone)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Address</label>
                    <p>{displayValue(selectedOrder.customerAddress)}</p>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.items.length === 0 ? (
                    <p className="items-unavailable">
                      Item details unavailable
                    </p>
                  ) : (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={item.id || `${selectedOrder.id}-${index}`}
                        className="order-item-detail"
                      >
                        <div className="item-name-qty">
                          <span className="item-name">
                            {item.name || "Unnamed item"}
                          </span>
                          <span className="item-qty">x{item.quantity || 0}</span>
                        </div>
                        <div className="item-prices">
                          <span className="item-price">
                            {formatCurrency(item.price)} each
                          </span>
                          <span className="item-subtotal">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Order Status</h3>
                <div className="status-info">
                  <div className="status-current">
                    <label>Current Status</label>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div className="status-datetime">
                    <label>Created</label>
                    <p>
                      {getOrderTime(selectedOrder)
                        ? new Date(selectedOrder.createdAt).toLocaleString()
                        : FALLBACK_TEXT}
                    </p>
                  </div>
                  <div className="status-datetime">
                    <label>Updated</label>
                    <p>
                      {selectedOrder.updatedAt
                        ? new Date(selectedOrder.updatedAt).toLocaleString()
                        : FALLBACK_TEXT}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.paymentMethod && (
                <div className="details-section">
                  <h3>Payment & Delivery</h3>
                  <div className="payment-info">
                    <div className="info-row">
                      <label>Payment Method</label>
                      <p>{displayValue(selectedOrder.paymentMethod)}</p>
                    </div>
                    {selectedOrder.deliveryNotes && (
                      <div className="info-row">
                        <label>Delivery Notes</label>
                        <p>{selectedOrder.deliveryNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== ACTION BUTTONS ==================== */}
              <div className="details-actions">
                {selectedOrder.status === "Pending" && (
                  <>
                    <button
                      className="action-btn primary-btn"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "Preparing")
                      }
                    >
                      Start Preparing
                    </button>
                  </>
                )}

                {selectedOrder.status === "Preparing" && (
                  <>
                    <button
                      className="action-btn primary-btn"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "Ready")
                      }
                    >
                      Ready for Pickup
                    </button>
                  </>
                )}

                {selectedOrder.status === "Ready" && (
                  <>
                    <button
                      className="action-btn primary-btn"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "Delivered")
                      }
                    >
                      Mark Delivered
                    </button>
                  </>
                )}

                {(selectedOrder.status === "Pending" ||
                  selectedOrder.status === "Preparing") && (
                  <>
                    <button
                      className="action-btn danger-btn"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "Cancelled" && (
                  <p className="info-text">This order has been cancelled</p>
                )}
              </div>
            </div>
          </AdminModal>
        )}

        {/* ==================== CONFIRM DIALOG ==================== */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={
            confirmDialog.action === "cancel"
              ? "Cancel Order?"
              : "Update Order Status?"
          }
          message={
            confirmDialog.action === "cancel"
              ? "Are you sure you want to cancel this order? This action cannot be undone."
              : `Change order status to ${confirmDialog.newStatus}?`
          }
          confirmText={
            confirmDialog.action === "cancel" ? "Cancel Order" : "Update Status"
          }
          isDangerous={confirmDialog.action === "cancel"}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialog({ isOpen: false })}
          isLoading={actionLoading}
        />
      </div>
    </div>
  );
}

// ==================== STATUS BADGE ====================
function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = String(status || "").toLowerCase();
  const statusClass =
    {
      pending: "badge-pending",
      preparing: "badge-preparing",
      ready: "badge-ready",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
      canceled: "badge-cancelled",
    }[normalizedStatus] || "badge-default";

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}
