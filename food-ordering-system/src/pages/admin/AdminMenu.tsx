import { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminModal from "../../components/admin/AdminModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import { useAdmin } from "../../context/AdminContext";
import type { FoodItem } from "../../types";
import "./AdminMenu.css";

type CategoryFilter = "All" | "Meals" | "Drinks" | "Snacks" | "Desserts";

interface FormData {
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  available: boolean;
}

export default function AdminMenu() {
  const {
    menuItems,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    loading,
    error,
    setError,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemId?: string;
  }>({
    isOpen: false,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "Meals",
    price: "",
    description: "",
    image: "",
    available: true,
  });

  useEffect(() => {
    fetchMenuItems();
    const interval = window.setInterval(() => {
      fetchMenuItems({ silent: true });
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  // ==================== FILTERING ====================
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, categoryFilter]);

  // ==================== FORM HANDLERS ====================
  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Meals",
      price: "",
      description: "",
      image: "",
      available: true,
    });
    setIsFormOpen(true);
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image || "",
      available: item.available ?? true,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Item name is required");
      return;
    }

    if (!formData.category) {
      setError("Category is required");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      setActionLoading(true);
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: formData.name,
          category: formData.category,
          price,
          description: formData.description,
          image: formData.image,
          available: formData.available,
        });
      } else {
        await addMenuItem({
          name: formData.name,
          category: formData.category,
          price,
          description: formData.description,
          image: formData.image,
          available: formData.available,
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setConfirmDialog({ isOpen: true, itemId });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.itemId) return;

    try {
      setActionLoading(true);
      await deleteMenuItem(confirmDialog.itemId);
      setConfirmDialog({ isOpen: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      setActionLoading(true);
      await toggleItemAvailability(itemId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle availability",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const categories: CategoryFilter[] = [
    "All",
    "Meals",
    "Drinks",
    "Snacks",
    "Desserts",
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader
          title="Menu Management"
          subtitle="Add, edit, and manage food items"
          actions={
            <button className="add-new-btn" onClick={handleAddNew}>
              Add New Item
            </button>
          }
        />

        {error && <div className="admin-error-banner">{error}</div>}

        {/* ==================== SEARCH AND FILTERS ==================== */}
        <div className="menu-controls">
          <div className="search-input-wrapper">
            <div className="admin-search-control">
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              <button
                type="button"
                className="admin-search-button"
                aria-label="Search menu items"
              />
            </div>
          </div>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tab ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== MENU ITEMS GRID ==================== */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state">No menu items found</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card">
                {item.image && (
                  <div className="menu-card-image">
                    <img src={item.image} alt={item.name} />
                    <div
                      className={`availability-badge ${item.available ? "available" : "unavailable"}`}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </div>
                  </div>
                )}
                <div className="menu-card-content">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="category-badge">{item.category}</span>
                  </div>

                  <p className="item-description">{item.description}</p>

                  <div className="item-price">₱{item.price.toFixed(2)}</div>

                  {item.stock !== undefined && (
                    <div
                      className={`stock-info ${item.stock === 0 ? "out-of-stock" : ""}`}
                    >
                      Stock: {item.stock} units
                    </div>
                  )}

                  <div className="menu-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`action-btn toggle-btn ${item.available ? "available-btn" : "unavailable-btn"}`}
                      onClick={() => handleToggleAvailability(item.id)}
                    >
                      {item.available ? "Unavailable" : "Available"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== ADD/EDIT FORM MODAL ==================== */}
        <AdminModal
          isOpen={isFormOpen}
          title={editingItem ? "Edit Item" : "Add New Item"}
          onClose={() => setIsFormOpen(false)}
          size="medium"
        >
          <form onSubmit={handleFormSubmit} className="menu-form">
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Burger"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option>Meals</option>
                  <option>Drinks</option>
                  <option>Snacks</option>
                  <option>Desserts</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Describe the item..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            <div className="form-group checkbox">
              <input
                id="available"
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
              />
              <label htmlFor="available">Available for ordering</label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsFormOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={actionLoading}
              >
                {actionLoading
                  ? "..."
                  : editingItem
                    ? "Update Item"
                    : "Add Item"}
              </button>
            </div>
          </form>
        </AdminModal>

        {/* ==================== DELETE CONFIRMATION ==================== */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Item?"
          message="Are you sure you want to delete this menu item? This action cannot be undone."
          confirmText="Delete"
          isDangerous={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog({ isOpen: false })}
          isLoading={actionLoading}
        />
      </div>
    </div>
  );
}
