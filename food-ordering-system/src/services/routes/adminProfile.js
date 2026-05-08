// routes/adminProfile.js
// GET /adminProfile — returns first admin profile

const express = require("express");
const router = express.Router();
const { getCollection } = require("../data/db");

// GET /adminProfile
router.get("/", (req, res) => {
  const admins = getCollection("users").filter(
    (u) => String(u.role).toLowerCase() === "admin",
  );

  if (!admins || admins.length === 0) {
    return res.status(404).json({
      message: "No admin profile found.",
    });
  }

  // Remove password before sending
  const { password, ...safeAdmin } = admins[0];

  return res.json(safeAdmin);
});

module.exports = router;
