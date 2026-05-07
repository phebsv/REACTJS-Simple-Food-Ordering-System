// routes/orders.js
// GET    /orders              — Get all orders (admin) or by customerId query
// GET    /orders/:id          — Get single order
// POST   /orders              — Place new order
// PATCH  /orders/:id          — Update order status

const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("./db");

// GET /orders — supports ?customerId= for customer filtering
router.get("/", (req, res) => {
  let orders = getCollection("orders");
  if (req.query.customerId) {
    orders = orders.filter((o) => o.customerId === req.query.customerId);
  }
  return res.json(orders);
});

// GET /orders/:id
router.get("/:id", (req, res) => {
  const orders = getCollection("orders");
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  return res.json(order);
});

// POST /orders — place new order
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
  return res.status(201).json(newOrder);
});

// PATCH /orders/:id — update status or any field
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
