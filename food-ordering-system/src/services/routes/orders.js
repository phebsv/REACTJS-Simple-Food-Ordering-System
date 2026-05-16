const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const statusFromStock = (stock) => {
  if (stock <= 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "Available";
};

const findItemByIdOrName = (items, id, name) => {
  if (id) {
    const byId = items.find((item) => String(item.id) === String(id));
    if (byId) return byId;
  }

  if (name) {
    const lowered = String(name).toLowerCase();
    return items.find(
      (item) => String(item.name || "").toLowerCase() === lowered,
    );
  }

  return undefined;
};

router.get("/", requireAuth, (req, res) => {
  let orders = getCollection("orders");
  if (req.query.customerId) {
    orders = orders.filter((o) => o.customerId === req.query.customerId);
  }
  return res.json(orders);
});

router.get("/:id", requireAuth, (req, res) => {
  const orders = getCollection("orders");
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  return res.json(order);
});

router.post("/", requireAuth, (req, res) => {
  const {
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    total,
    paymentMethod = "cash",
    deliveryNotes = "",
    status = "Pending",
  } = req.body;

  if (!customerId || !items || items.length === 0)
    return res
      .status(400)
      .json({ message: "customerId and items are required." });

  const orders = getCollection("orders");
  const newOrder = {
    id: "order" + Date.now().toString(36),
    customerId,
    customerName: customerName || "",
    customerEmail: customerEmail || "",
    customerPhone: customerPhone || "",
    customerAddress: customerAddress || "",
    items,
    subtotal: Number(subtotal || total || 0),
    total: Number(total || subtotal || 0),
    status,
    paymentMethod,
    deliveryNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  setCollection("orders", orders);

  const menuItems = getCollection("menu");
  const inventoryItems = getCollection("inventory");
  let menuChanged = false;
  let inventoryChanged = false;

  (items || []).forEach((item) => {
    const itemId = item?.id || item?.menuId || item?.menu_id || "";
    const itemName = item?.name || item?.foodName || item?.food_name || "";
    const quantity = Math.max(0, Number(item?.quantity || 0));

    if (!quantity) return;

    const menuItem = findItemByIdOrName(menuItems, itemId, itemName);
    if (menuItem) {
      const nextStock = Math.max(0, Number(menuItem.stock || 0) - quantity);
      menuItem.stock = nextStock;
      menuItem.available = nextStock > 0;
      menuItem.lastUpdated = new Date().toISOString();
      menuChanged = true;
    }

    const inventoryItem = findItemByIdOrName(inventoryItems, itemId, itemName);
    if (inventoryItem) {
      const currentStock = Number(inventoryItem.stock || 0);
      const nextStock = Math.max(0, currentStock - quantity);
      inventoryItem.stock = nextStock;
      inventoryItem.status = statusFromStock(nextStock);
      inventoryItem.lastUpdated = new Date().toISOString();
      inventoryChanged = true;
    }
  });

  if (menuChanged) setCollection("menu", menuItems);
  if (inventoryChanged) setCollection("inventory", inventoryItems);
  return res.status(201).json(newOrder);
});

router.patch("/:id", requireAuth, (req, res) => {
  const orders = getCollection("orders");
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Order not found." });

  const isAdmin = req.user?.role === "admin";
  const isOwner = String(orders[idx].customerId) === String(req.user?.id);
  const nextStatus =
    req.body.status !== undefined ? String(req.body.status) : undefined;
  const isCancelRequest = nextStatus?.toLowerCase() === "cancelled";
  const currentStatus = String(orders[idx].status || "").toLowerCase();
  const canCustomerCancel =
    isOwner &&
    isCancelRequest &&
    ["pending", "preparing"].includes(currentStatus);

  if (!isAdmin && !canCustomerCancel) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const fields = ["status", "paymentMethod", "deliveryNotes", "updatedAt"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) orders[idx][f] = req.body[f];
  });
  orders[idx].updatedAt = new Date().toISOString();

  setCollection("orders", orders);
  return res.json(orders[idx]);
});

module.exports = router;
