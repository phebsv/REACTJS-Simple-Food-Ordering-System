const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");

router.get("/", (req, res) => {
  let orders = getCollection("orders");
  if (req.query.customerId) {
    orders = orders.filter((o) => o.customerId === req.query.customerId);
  }
  return res.json(orders);
});

router.get("/:id", (req, res) => {
  const orders = getCollection("orders");
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  return res.json(order);
});

router.post("/", (req, res) => {
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
  const menuItems = getCollection("menu");
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

  if (Array.isArray(items) && items.length) {
    items.forEach((orderItem) => {
      const idx = menuItems.findIndex(
        (menuItem) => String(menuItem.id) === String(orderItem.id),
      );
      if (idx === -1) return;

      const quantity = Math.max(0, Number(orderItem.quantity) || 0);
      const nextStock = Math.max(0, Number(menuItems[idx].stock) - quantity);
      menuItems[idx].stock = nextStock;
      if (nextStock === 0) {
        menuItems[idx].available = false;
      }
    });

    setCollection("menu", menuItems);
  }

  orders.push(newOrder);
  setCollection("orders", orders);
  return res.status(201).json(newOrder);
});

router.patch("/:id", (req, res) => {
  const orders = getCollection("orders");
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Order not found." });

  const fields = ["status", "paymentMethod", "deliveryNotes", "updatedAt"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) orders[idx][f] = req.body[f];
  });
  orders[idx].updatedAt = new Date().toISOString();

  setCollection("orders", orders);
  return res.json(orders[idx]);
});

module.exports = router;
