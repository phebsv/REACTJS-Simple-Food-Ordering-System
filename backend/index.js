const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.resolve(
  __dirname,
  "..",
  "food-ordering-system",
  "src",
  "services",
  "db.json",
);

app.use(cors());
app.use(express.json());

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.admins) data.admins = [];
    return data;
  } catch (error) {
    if (error.code === "ENOENT") {
      const fresh = { users: [], admins: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(fresh, null, 2));
      return fresh;
    }
    throw error;
  }
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeString(value) {
  return String(value || "").trim().toLowerCase();
}

function toSafeUser(user) {
  const { passwordHash, password, ...safeUser } = user;
  return safeUser;
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, agreeToTerms } =
      req.body || {};

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (agreeToTerms !== true) {
      return res.status(400).json({ message: "You must agree to the terms." });
    }

    const db = await readDb();
    const normalizedEmail = normalizeEmail(email);
    const existingUser = db.users.find(
      (user) => normalizeEmail(user.email) === normalizedEmail,
    );

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const existingAdmin = db.admins.find(
      (admin) => normalizeEmail(admin.email) === normalizedEmail,
    );

    if (existingAdmin) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName =
      `${String(firstName).trim()} ${String(lastName).trim()}`.trim();

    const newUser = {
      id: crypto.randomUUID(),
      name: fullName,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      phone: String(phoneNumber).trim(),
      address: "",
      passwordHash,
      agreeToTerms: true,
      createdAt: new Date().toISOString(),
      role: "user",
    };

    db.users.push(newUser);
    await writeDb(db);

    return res.status(201).json({
      message: "Registration successful.",
      user: toSafeUser(newUser),
      token: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error while registering." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const db = await readDb();
    const normalizedEmail = normalizeEmail(email);

    const admin = db.admins.find((item) => {
      const byEmail = normalizeEmail(item.email) === normalizedEmail;
      const byUsername = normalizeString(item.username) === normalizedEmail;
      return byEmail || byUsername;
    });

    if (admin && String(admin.password) === String(password)) {
      return res.status(200).json({
        message: "Login successful.",
        user: {
          id: String(admin.id || "admin"),
          name: admin.name || admin.username || "Admin",
          email: admin.email || "",
          role: "admin",
          isAdmin: true,
        },
        token: crypto.randomUUID(),
      });
    }
    const user = db.users.find(
      (item) => normalizeEmail(item.email) === normalizedEmail,
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let matches = false;
    if (user.passwordHash) {
      matches = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password) {
      matches = String(user.password) === String(password);
    }

    if (!matches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        ...toSafeUser(user),
        role: "user",
        isAdmin: false,
      },
      token: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error while logging in." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
