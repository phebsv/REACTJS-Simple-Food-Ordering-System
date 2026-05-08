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

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filterStatus]);

  // ==================== FILTERING ====================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query);

      const matchesStatus =
        filterStatus === "All" || order.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
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
                    <td className="order-id">#{order.id.slice(0, 8)}</td>
                    <td>
                      <div className="customer-info">
                        <div>{order.customerName}</div>
                        <div className="customer-email">
                          {order.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td>{order.items.length} item(s)</td>
                    <td className="order-total">₱{order.total.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="order-datetime">
                      {new Date(order.createdAt).toLocaleDateString()} <br />
                      {new Date(order.createdAt).toLocaleTimeString()}
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
            title={`Order #${selectedOrder.id.slice(0, 8)}`}
            onClose={() => setIsDetailsOpen(false)}
            size="large"
          >
            <div className="order-details">
              <div className="details-section">
                <h3>Customer Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <p>{selectedOrder.customerName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedOrder.customerEmail}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="detail-item">
                    <label>Address</label>
                    <p>{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="order-item-detail">
                      <div className="item-name-qty">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                      <div className="item-prices">
                        <span className="item-price">
                          ₱{item.price.toFixed(2)} each
                        </span>
                        <span className="item-subtotal">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-section">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₱{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₱{selectedOrder.total.toFixed(2)}</span>
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
                    <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="status-datetime">
                    <label>Updated</label>
                    <p>{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.paymentMethod && (
                <div className="details-section">
                  <h3>Payment & Delivery</h3>
                  <div className="payment-info">
                    <div className="info-row">
                      <label>Payment Method</label>
                      <p>{selectedOrder.paymentMethod}</p>
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
  const statusClass =
    {
      Pending: "badge-pending",
      Preparing: "badge-preparing",
      Ready: "badge-ready",
      Delivered: "badge-delivered",
      Cancelled: "badge-cancelled",
    }[status] || "badge-default";

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}
