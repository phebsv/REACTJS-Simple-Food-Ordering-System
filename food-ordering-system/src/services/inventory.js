// routes/inventory.js
// GET   /inventory      — Get all inventory items
// GET   /inventory/:id  — Get single item
// PATCH /inventory/:id  — Update stock or status

const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("./db");

// GET /inventory
router.get("/", (req, res) => {
  return res.json(getCollection("inventory"));
});

// GET /inventory/:id
router.get("/:id", (req, res) => {
  const items = getCollection("inventory");
  const item = items.find((i) => i.id === req.params.id);
  if (!item)
    return res.status(404).json({ message: "Inventory item not found." });
  return res.json(item);
});

// PATCH /inventory/:id
router.patch("/:id", (req, res) => {
  const items = getCollection("inventory");
  const idx = items.findIndex((i) => i.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ message: "Inventory item not found." });

  const { stock, status } = req.body;
  if (stock !== undefined) items[idx].stock = Number(stock);
  if (status !== undefined) items[idx].status = status;
  items[idx].lastUpdated = new Date().toISOString();

  setCollection("inventory", items);
  return res.json(items[idx]);
});

module.exports = router;
