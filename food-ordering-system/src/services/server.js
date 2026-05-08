const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/admins", require("./routes/admins"));
app.use("/menu", require("./routes/menu"));
app.use("/orders", require("./routes/orders"));
app.use("/inventory", require("./routes/inventory"));
app.use("/reviews", require("./routes/reviews"));
app.use("/adminProfile", require("./routes/adminProfile"));
app.use("/cart_items", require("./routes/cart_items"));

app.get("/", (req, res) => {
  res.json({ message: "[BURGER] NomNom API is running.", port: PORT });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found.` });
});

app.listen(PORT, () => {
  console.log(`[OK] NomNom backend running at http://localhost:${PORT}`);
});