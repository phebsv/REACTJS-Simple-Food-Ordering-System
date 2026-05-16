const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");
const { requireAdmin } = require("../middleware/auth");

const statusFromStock = (stock) => {
  if (stock <= 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "Available";
};

router.get("/", requireAdmin, (req, res) => {
  return res.json(getCollection("inventory"));
});

router.get("/:id", requireAdmin, (req, res) => {
  const items = getCollection("inventory");
  const item = items.find((i) => i.id === req.params.id);
  if (!item)
    return res.status(404).json({ message: "Inventory item not found." });
  return res.json(item);
});

router.patch("/:id", requireAdmin, (req, res) => {
  const items = getCollection("inventory");
  const idx = items.findIndex((i) => i.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ message: "Inventory item not found." });

  const { stock, status } = req.body;
  if (stock !== undefined) {
    items[idx].stock = Number(stock);
    items[idx].status = statusFromStock(items[idx].stock);
  } else if (status !== undefined) {
    items[idx].status = status;
  }
  items[idx].lastUpdated = new Date().toISOString();

  setCollection("inventory", items);
  return res.json(items[idx]);
});

module.exports = router;
