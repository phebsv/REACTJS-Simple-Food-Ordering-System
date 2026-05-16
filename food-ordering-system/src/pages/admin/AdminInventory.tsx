import { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import AdminModal from "../../components/admin/AdminModal";
import { useAdmin } from "../../context/AdminContext";
import type { InventoryItem } from "../../types";
import "./AdminInventory.css";

type StatusFilter =
  | "All"
  | "Available"
  | "Low Stock"
  | "Out of Stock"
  | "Unavailable";

interface RestockFormData {
  quantity: string;
}

export default function AdminInventory() {
  const {
    inventoryItems,
    fetchInventory,
    updateStock,
    updateInventoryStatus,
    loading,
    error,
    setError,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockForm, setRestockForm] = useState<RestockFormData>({
    quantity: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  // ==================== FILTERING ====================
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventoryItems, searchQuery, statusFilter]);

  // ==================== HANDLERS ====================
  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    setRestockForm({ quantity: item.stock.toString() });
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const newQuantity = parseInt(restockForm.quantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      setActionLoading(true);
      await updateStock(selectedItem.id, newQuantity);
      setIsRestockOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restock item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      await updateInventoryStatus(itemId, newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const statusFilters: StatusFilter[] = [
    "All",
    "Available",
    "Low Stock",
    "Out of Stock",
    "Unavailable",
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader
          title="Inventory Management"
          subtitle="Track and manage stock levels for all items"
        />

        {error && <div className="admin-error-banner">{error}</div>}

        {/* ==================== SEARCH BAR ==================== */}
        <div className="inventory-search-bar">
          <div className="admin-search-control">
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <button
              type="button"
              className="admin-search-button"
              aria-label="Search inventory"
            />
          </div>
        </div>

        {/* ==================== STATUS FILTER TABS ==================== */}
        <div className="status-filter-tabs">
          {statusFilters.map((status) => (
            <button
              key={status}
              className={`filter-tab ${statusFilter === status ? "active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
              <span className="filter-count">
                {status === "All"
                  ? inventoryItems.length
                  : inventoryItems.filter((i) => i.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* ==================== INVENTORY TABLE ==================== */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state">No inventory items found</p>
          </div>
        ) : (
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`status-${item.status.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <td className="item-name">{item.name}</td>
                    <td>{item.category}</td>
                    <td className="stock-quantity">
                      <span
                        className={`stock-badge ${getStockClass(item.stock)}`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td>
                      <StatusSelect
                        currentStatus={item.status}
                        onStatusChange={(status) =>
                          handleStatusChange(item.id, status)
                        }
                        disabled={actionLoading}
                        isOutOfStock={item.stock <= 0}
                      />
                    </td>
                    <td className="last-updated">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="action-btn restock-btn"
                        onClick={() => handleOpenRestock(item)}
                        disabled={actionLoading}
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== RESTOCK MODAL ==================== */}
        <AdminModal
          isOpen={isRestockOpen}
          title={`Restock: ${selectedItem?.name}`}
          onClose={() => setIsRestockOpen(false)}
          size="small"
        >
          <form onSubmit={handleRestockSubmit} className="restock-form">
            <div className="form-group">
              <label>Current Stock</label>
              <div className="current-stock">{selectedItem?.stock} units</div>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">New Quantity *</label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ quantity: e.target.value })}
                required
                placeholder="Enter new quantity"
              />
              <small className="form-hint">
                Set the total stock quantity (not the amount to add)
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsRestockOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "Update Stock"}
              </button>
            </div>
          </form>
        </AdminModal>
      </div>
    </div>
  );
}

// ==================== STATUS SELECT COMPONENT ====================
interface StatusSelectProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  disabled: boolean;
  isOutOfStock: boolean;
}

function StatusSelect({
  currentStatus,
  onStatusChange,
  disabled,
  isOutOfStock,
}: StatusSelectProps) {
  const statuses = ["Available", "Low Stock", "Out of Stock", "Unavailable"];

  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      className={`status-select status-${currentStatus.toLowerCase().replace(/\s+/g, "-")}`}
      disabled={disabled}
    >
      {statuses.map((status) => (
        <option
          key={status}
          value={status}
          disabled={isOutOfStock && status === "Available"}
        >
          {status}
        </option>
      ))}
    </select>
  );
}

// ==================== HELPER FUNCTION ====================
function getStockClass(stock: number): string {
  if (stock === 0) return "critical";
  if (stock < 10) return "warning";
  return "good";
}
