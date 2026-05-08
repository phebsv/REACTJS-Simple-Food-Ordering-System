// routes/ratings.js
// POST /ratings — Submit a rating for a food item
// GET /ratings?foodItemId= — Get average rating for a food item

const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");

router.get("/", (req, res) => {
  let reviews = getCollection("reviews");

  // Filter by foodItemId if provided
  if (req.query.foodItemId) {
    reviews = reviews.filter((r) => String(r.foodItemId) === String(req.query.foodItemId));
  }

  // Calculate average rating
  if (reviews.length === 0) {
    return res.json({ averageRating: 0, totalReviews: 0, reviews: [] });
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return res.json({
    averageRating: parseFloat(average.toFixed(2)),
    totalReviews: reviews.length,
    reviews,
  });
});

router.post("/", (req, res) => {
  const {
    orderId,
    customerId,
    customerName,
    foodItemId,
    foodItemName,
    rating,
    comment = "",
  } = req.body;

  if (!orderId || !customerId || !foodItemId || !rating) {
    return res
      .status(400)
      .json({
        message: "orderId, customerId, foodItemId, and rating are required.",
      });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  const reviews = getCollection("reviews");

  // Check if review already exists
  const existingReview = reviews.find(
    (r) =>
      r.orderId === orderId &&
      r.customerId === customerId &&
      r.foodItemId === foodItemId,
  );

  if (existingReview) {
    return res.status(400).json({ message: "You already rated this item." });
  }

  const newReview = {
    id: "review" + Date.now().toString(36),
    orderId,
    customerId,
    customerName: customerName || "Customer",
    foodItemId,
    foodItemName: foodItemName || "Item",
    rating: Number(rating),
    comment: String(comment).trim(),
    createdAt: new Date().toISOString(),
    hidden: false,
  };

  reviews.push(newReview);
  setCollection("reviews", reviews);

  return res.status(201).json(newReview);
});

module.exports = router;
