// routes/cart_items.js
// GET    /cart_items?customerId=  — Get cart items for a customer
// POST   /cart_items              — Add item to cart
// PATCH  /cart_items/:id          — Update quantity
// DELETE /cart_items/:id          — Remove item

const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");

// GET /cart_items?customerId=&menuId=
router.get("/", (req, res) => {
  let items = getCollection("cart_items");

  if (req.query.customerId) {
    items = items.filter((i) => i.customerId === req.query.customerId);
  }
  if (req.query.menuId) {
    items = items.filter((i) => i.menuId === req.query.menuId);
  }

  return res.json(items);
});

// POST /cart_items — add new cart item
router.post("/", (req, res) => {
  const { customerId, menuId, name, description, price, category, image, quantity } =
    req.body;

  if (!customerId || !menuId || !name || price == null)
    return res.status(400).json({ message: "customerId, menuId, name, and price are required." });

  const items = getCollection("cart_items");
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    customerId,
    menuId: String(menuId),
    name,
    description: description || "",
    price: Number(price),
    category: category || "",
    image: image || "",
    quantity: Number(quantity) || 1,
  };

  items.push(newItem);
  setCollection("cart_items", items);
  return res.status(201).json(newItem);
});

// PATCH /cart_items/:id — update quantity
router.patch("/:id", (req, res) => {
  const items = getCollection("cart_items");
  const idx = items.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Cart item not found." });

  if (req.body.quantity !== undefined) {
    items[idx].quantity = Number(req.body.quantity);
  }

  setCollection("cart_items", items);
  return res.json(items[idx]);
});

// DELETE /cart_items/:id
router.delete("/:id", (req, res) => {
  const items = getCollection("cart_items");
  const filtered = items.filter((i) => i.id !== req.params.id);
  if (filtered.length === items.length)
    return res.status(404).json({ message: "Cart item not found." });

  setCollection("cart_items", filtered);
  return res.json({ message: "Cart item removed." });
});

module.exports = router;