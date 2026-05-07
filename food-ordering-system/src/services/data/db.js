// db.js — read/write helpers for JSON flat-file database

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
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
