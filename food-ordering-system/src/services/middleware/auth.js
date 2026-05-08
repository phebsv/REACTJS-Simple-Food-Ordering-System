const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "nomnom_secret_2024";

function generateToken(id, role) {
  return jwt.sign({ id, role }, SECRET, { expiresIn: "24h" });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  try {
    req.user = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Admins only." });
    }
    next();
  });
}

module.exports = { generateToken, requireAuth, requireAdmin };