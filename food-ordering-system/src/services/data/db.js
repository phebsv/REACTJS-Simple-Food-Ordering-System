const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");

const DEFAULT_DB = {
  users: [],
  admins: [],
  menu: [],
  orders: [],
  inventory: [],
  reviews: [],
  cart_items: [],
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(DEFAULT_DB);
    return { ...DEFAULT_DB };
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  if (!raw.trim()) {
    writeDB(DEFAULT_DB);
    return { ...DEFAULT_DB };
  }

  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DB, ...parsed };
  } catch (err) {
    writeDB(DEFAULT_DB);
    return { ...DEFAULT_DB };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getCollection(name) {
  return readDB()[name] || [];
}

function setCollection(name, records) {
  const db = readDB();
  db[name] = records;
  writeDB(db);
}

module.exports = { readDB, writeDB, getCollection, setCollection };