import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";
import path from "path";
import { fileURLToPath } from "url";

import { config } from "../../../shared/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve DB path dynamically based on config
const dbPath = path.resolve(__dirname, "../../../", config.database.filename);

// Using Node 22+ built-in sqlite module for synchronous DB operations
const db = new DatabaseSync(dbPath);

console.log("Connected to the SQLite database using node:sqlite.");

// Initialize database schema
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

/**
 * Registers a new user with a hashed password.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<boolean>} True if successful, false if username exists
 */
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

/**
 * Verifies a user's credentials against the stored hash.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<boolean>} True if credentials are valid, false otherwise
 */
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

/**
 * Persists a new chat message to the database.
 * @param {string} room 
 * @param {string} sender 
 * @param {string} content 
 * @param {number} timestamp 
 */
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

/**
 * Retrieves the most recent messages for a given room.
 * @param {string} room 
 * @param {number} limit Maximum number of messages to fetch (default configured)
 * @returns {Promise<Array>} Array of message objects in chronological order
 */
export function getHistory(room, limit = config.defaults.historyLimit) {
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
