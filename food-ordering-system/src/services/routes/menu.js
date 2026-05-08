const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");
const { requireAdmin } = require("../middleware/auth");

router.get("/", (req, res) => {
  const items = getCollection("menu");
  return res.json(items);
});

router.get("/:id", (req, res) => {
  const items = getCollection("menu");
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Menu item not found." });
  return res.json(item);
});

router.post("/", requireAdmin, (req, res) => {
  const {
    name,
    description = "",
    price,
    category,
    image = "",
    available = true,
    stock = 0,
  } = req.body;

  if (!name || !price || !category)
    return res
      .status(400)
      .json({ message: "name, price, and category are required." });

  const items = getCollection("menu");
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name,
    description,
    price: Number(price),
    category,
    image,
    available: Boolean(available),
    stock: Number(stock),
  };

  items.push(newItem);
  setCollection("menu", items);
  return res.status(201).json(newItem);
});

router.patch("/:id", requireAdmin, (req, res) => {
  const items = getCollection("menu");
  const idx = items.findIndex((i) => i.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ message: "Menu item not found." });

  const fields = [
    "name",
    "description",
    "price",
    "category",
    "image",
    "available",
    "stock",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) items[idx][f] = req.body[f];
  });

  setCollection("menu", items);
  return res.json(items[idx]);
});

router.delete("/:id", requireAdmin, (req, res) => {
  const items = getCollection("menu");
  const filtered = items.filter((i) => i.id !== req.params.id);
  if (filtered.length === items.length)
    return res.status(404).json({ message: "Menu item not found." });

  setCollection("menu", filtered);
  return res.json({ message: "Menu item deleted." });
});

module.exports = router;