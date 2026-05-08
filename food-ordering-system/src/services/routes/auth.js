const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { getCollection, setCollection } = require("../data/db");
const { generateToken } = require("../middleware/auth");

router.post("/register", (req, res) => {
  const { name, email, phone = "", password, address = "" } = req.body;

  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });

  const users = getCollection("users");
  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "Email already registered." });

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const newUser = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name,
    email,
    phone,
    password,
    passwordHash,
    address,
    role: "user",
  };

  users.push(newUser);
  setCollection("users", users);

  const { password: _, ...safeUser } = newUser;
  const token = generateToken(newUser.id, "customer");

  return res.status(201).json({
    message: "Account created successfully.",
    data: { token, user: safeUser },
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const normalized = String(email).trim().toLowerCase();

  const users = getCollection("users");
  const admin = users.find(
    (u) =>
      String(u.role).toLowerCase() === "admin" &&
      (String(u.username || "").toLowerCase() === normalized ||
        String(u.email || "").toLowerCase() === normalized) &&
      (u.passwordHash
        ? bcrypt.compareSync(String(password), String(u.passwordHash))
        : String(u.password) === String(password)),
  );

  if (admin) {
    const token = generateToken(admin.id, "admin");
    const { password: _, ...safeAdmin } = admin;
    return res.json({
      message: "Login successful.",
      data: { token, user: { ...safeAdmin, role: "admin", isAdmin: true } },
    });
  }

  const user = users.find((u) => String(u.email).toLowerCase() === normalized);

  if (!user)
    return res.status(401).json({ message: "Invalid email or password." });

  const matches = user.passwordHash
    ? bcrypt.compareSync(String(password), String(user.passwordHash))
    : String(user.password) === String(password);

  if (!matches)
    return res.status(401).json({ message: "Invalid email or password." });

  const token = generateToken(user.id, "customer");
  const { password: _, passwordHash: __, ...safeUser } = user;

  return res.json({
    message: "Login successful.",
    data: { token, user: { ...safeUser, role: "user", isAdmin: false } },
  });
});

router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const users = getCollection("users");
  const normalized = String(username).toLowerCase();
  const admin = users.find(
    (u) =>
      String(u.role).toLowerCase() === "admin" &&
      (String(u.username || "").toLowerCase() === normalized ||
        String(u.email || "").toLowerCase() === normalized) &&
      (u.passwordHash
        ? bcrypt.compareSync(String(password), String(u.passwordHash))
        : String(u.password) === String(password)),
  );

  if (!admin)
    return res.status(401).json({ message: "Invalid admin credentials." });

  const token = generateToken(admin.id, "admin");
  const { password: _, ...safeAdmin } = admin;

  return res.json({
    message: "Admin login successful.",
    data: { token, admin: safeAdmin },
  });
});

module.exports = router;