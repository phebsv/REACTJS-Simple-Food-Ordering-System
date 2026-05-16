const express = require("express");
const router = express.Router();
const { getCollection } = require("../data/db");
const { requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, (req, res) => {
  const admins = getCollection("users").filter(
    (u) => String(u.role).toLowerCase() === "admin",
  );

  if (!admins || admins.length === 0) {
    return res.status(404).json({
      message: "No admin profile found.",
    });
  }

  const { password, passwordHash, ...safeAdmin } = admins[0];

  return res.json(safeAdmin);
});

module.exports = router;
