// routes/reviews.js
// GET    /reviews       — Get all reviews
// POST   /reviews       — Add a review
// PATCH  /reviews/:id   — Hide a review
// DELETE /reviews/:id   — Delete a review

const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../db");

// GET /reviews
router.get("/", (req, res) => {
  return res.json(getCollection("reviews"));
});

// POST /reviews
router.post("/", (req, res) => {
  const { orderId, customerId, customerName, foodItemId, foodItemName, rating, comment } = req.body;

  if (!orderId || !customerName || !rating)
    return res.status(400).json({ message: "orderId, customerName, and rating are required." });

  const reviews = getCollection("reviews");
  const newReview = {
    id: "review" + Date.now().toString(36),
    orderId,
    customerId: customerId || "",
    customerName,
    foodItemId: foodItemId || "",
    foodItemName: foodItemName || "",
    rating: Number(rating),
    comment: comment || "",
    createdAt: new Date().toISOString(),
    hidden: false,
  };

  reviews.push(newReview);
  setCollection("reviews", reviews);
  return res.status(201).json(newReview);
});

// PATCH /reviews/:id — hide review
router.patch("/:id", (req, res) => {
  const reviews = getCollection("reviews");
  const idx = reviews.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Review not found." });

  if (req.body.hidden !== undefined) reviews[idx].hidden = req.body.hidden;

  setCollection("reviews", reviews);
  return res.json(reviews[idx]);
});

// DELETE /reviews/:id
router.delete("/:id", (req, res) => {
  const reviews = getCollection("reviews");
  const filtered = reviews.filter((r) => r.id !== req.params.id);
  if (filtered.length === reviews.length)
    return res.status(404).json({ message: "Review not found." });

  setCollection("reviews", filtered);
  return res.json({ message: "Review deleted." });
});

module.exports = router;