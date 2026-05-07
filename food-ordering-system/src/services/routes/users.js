// routes/users.js
// GET    /users?email=&password=  — Login query (kept for original Login.tsx compatibility)
// GET    /users/:id               — Get user by ID
// PATCH  /users/:id               — Update user profile

const express = require("express");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

// GET /users?email=&password= — original Login.tsx compatibility
router.get("/", (req, res) => {
  const { email, password } = req.query;
  let users = getCollection("users");

  if (email && password) {
    users = users.filter((u) => u.email === email && u.password === password);
    // Strip passwords before returning
    return res.json(users.map(({ password: _, ...u }) => u));
  }

  // Return all users (without passwords)
  return res.json(users.map(({ password: _, ...u }) => u));
});

// GET /users/:id
router.get("/:id", requireAuth, (req, res) => {
  const users = getCollection("users");
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  const { password: _, ...safeUser } = user;
  return res.json(safeUser);
});

// PATCH /users/:id — update name, phone, address
router.patch("/:id", requireAuth, (req, res) => {
  const users = getCollection("users");
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "User not found." });

  const { name, phone, address } = req.body;
  if (name !== undefined) users[idx].name = name;
  if (phone !== undefined) users[idx].phone = phone;
  if (address !== undefined) users[idx].address = address;

  setCollection("users", users);
  const { password: _, ...safeUser } = users[idx];
  return res.json(safeUser);
});

module.exports = router;
