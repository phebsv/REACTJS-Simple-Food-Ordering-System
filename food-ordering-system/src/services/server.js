// server.js — NomNom Food Ordering System Backend
// Node.js + Express + JSON flat files

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth", require("./auth"));
app.use("/users", require("./users"));
app.use("/admins", require("./admins"));
app.use("/menu", require("./routes/menu"));
app.use("/orders", require("./routes/orders"));
app.use("/inventory", require("./routes/inventory"));
app.use("/reviews", require("./reviews"));
app.use("/cart_items", require("./routes/cart_items"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🍔 NomNom API is running.", port: PORT });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found.` });
});

app.listen(PORT, () => {
  console.log(`✅ NomNom backend running at http://localhost:${PORT}`);
});
