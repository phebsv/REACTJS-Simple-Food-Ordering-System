const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

router.get("/", (req, res) => {
  const { email, password } = req.query;
  let users = getCollection("users");

  if (email && password) {
    const normalized = String(email).trim().toLowerCase();
    users = users.filter(
      (u) =>
        String(u.email).toLowerCase() === normalized &&
        u.passwordHash &&
        bcrypt.compareSync(String(password), String(u.passwordHash)),
    );
    return res.json(users.map(({ password: _, passwordHash: __, ...u }) => u));
  }

  return res.json(users.map(({ password: _, passwordHash: __, ...u }) => u));
});

router.get("/:id", requireAuth, (req, res) => {
  const users = getCollection("users");
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  const { password: _, passwordHash: __, ...safeUser } = user;
  return res.json(safeUser);
});

router.patch("/:id", requireAuth, (req, res) => {
  const users = getCollection("users");
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "User not found." });

  const { name, phone, address } = req.body;
  if (name !== undefined) users[idx].name = name;
  if (phone !== undefined) users[idx].phone = phone;
  if (address !== undefined) users[idx].address = address;

  setCollection("users", users);
  const { password: _, passwordHash: __, ...safeUser } = users[idx];
  return res.json(safeUser);
});

module.exports = router;
