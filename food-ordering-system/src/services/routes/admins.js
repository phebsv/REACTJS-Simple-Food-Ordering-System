const express = require("express");
const router = express.Router();
const { getCollection } = require("../data/db");

router.get("/", (req, res) => {
  let admins = getCollection("users").filter(
    (u) => String(u.role).toLowerCase() === "admin",
  );

  if (req.query.username) {
    admins = admins.filter(
      (a) =>
        String(a.username || "").toLowerCase() ===
        String(req.query.username).toLowerCase(),
    );
  }

  return res.json(admins.map(({ password: _, passwordHash: __, ...a }) => a));
});

module.exports = router;
