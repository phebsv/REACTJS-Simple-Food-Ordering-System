// routes/admins.js
// GET /admins?username= — kept for original AdminContext.tsx compatibility

const express = require("express");
const router = express.Router();
const { getCollection } = require("../data/db");

router.get("/", (req, res) => {
  let admins = getCollection("users").filter(
    (u) => String(u.role).toLowerCase() === "admin",
  );

  // Filter by username if provided (original AdminContext does this)
  if (req.query.username) {
    admins = admins.filter(
      (a) =>
        String(a.username || "").toLowerCase() ===
        String(req.query.username).toLowerCase(),
    );
  }

  // Never return passwords
  return res.json(admins.map(({ password: _, ...a }) => a));
});

module.exports = router;
