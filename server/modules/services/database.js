import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../chat.db");

// Using Node 22+ built-in sqlite module
const db = new DatabaseSync(dbPath);

console.log("Connected to the SQLite database using node:sqlite.");

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT,
    sender TEXT,
    content TEXT,
    timestamp INTEGER
  );
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT
  );
`);

export async function registerUser(username, password) {
  try {
    const hash = await argon2.hash(password);
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, hash);
    return true;
  } catch (err) {
    if (err.code === "ERR_SQLITE_ERROR" || err.message.includes("UNIQUE")) {
      return false; // Username already exists
    }
    throw err;
  }
}

export async function verifyUser(username, password) {
  try {
    const stmt = db.prepare("SELECT password FROM users WHERE username = ?");
    const user = stmt.get(username);
    if (!user) return false;
    const match = await argon2.verify(user.password, password);
    return match;
  } catch (err) {
    throw err;
  }
}

export function insertMessage(room, sender, content, timestamp) {
  try {
    const stmt = db.prepare(
      "INSERT INTO messages (room, sender, content, timestamp) VALUES (?, ?, ?, ?)"
    );
    stmt.run(room, sender, content, timestamp);
  } catch (err) {
    console.error("Error inserting message", err);
  }
}

export function getHistory(room, limit = 50) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        "SELECT sender as username, room, content, timestamp FROM messages WHERE room = ? ORDER BY timestamp DESC LIMIT ?"
      );
      const rows = stmt.all(room, limit);
      // reverse it so it goes oldest to newest (chronological order)
      resolve(rows.reverse());
    } catch (err) {
      reject(err);
    }
  });
}
