# WireChat - A Real-Time Terminal Messaging Platform

WireChat is a lightweight, real-time terminal chat application built with **Node.js** and **WebSockets**. Featuring a fully interactive Terminal User Interface (TUI), WireChat provides room-based messaging, private messages, user authentication, and persistent chat history backed by SQLite.

---

## ✨ Features

* **Terminal UI (TUI):** A rich, interactive terminal interface built with `blessed` and `chalk`.
* **Real-time Communication:** Low-latency bi-directional messaging using WebSockets (`ws`).
* **Authentication:** Secure user registration and login with password hashing via `argon2`.
* **Room-based Chat:** Create new rooms, list available rooms, and join different channels.
* **Private Messaging (DM):** Send direct messages to specific users.
* **Persistent History:** Messages are logged and stored in an SQLite database, allowing you to fetch past chat history.
* **System Notifications:** Real-time alerts when users join/leave rooms or when errors occur.
* **Online Status:** Check who is currently connected to the server.

---

## 🏗️ Architecture

```text
        Client A
           │
           │
      WebSocket
           │
 ┌──────────────────┐
 │   Wire Server    │
 │  (SQLite & WS)   │
 └──────────────────┘
      │         │
      │         │
 Client B    Client C
```

The server maintains:

* Connected users and their authentication state
* Active rooms and their participants
* Message broadcasting and packet validation
* Chat history stored in a local SQLite database

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/lokeshkrio/wire-chat.git
cd wire-chat
```

### 2. Install dependencies

**Server setup:**

```bash
cd server
npm install
```

**Client setup:**

```bash
cd client
npm install
```

---

## 💻 Running the Application

### Start the server

```bash
cd server
node server.js
```

*The server runs on port `5051` by default and initializes the SQLite database.*

### Start a client

Open a separate terminal window:

```bash
cd client
node client.js
```

Upon launching, the interactive terminal UI will appear. You must register and login before chatting.

---

## 📝 Commands

Once connected, you can use the following commands within the client's input box:

### Authentication

* `/register <username> <password>` - Register a new account.
* `/login <username> <password>` - Login to an existing account.

### Rooms & Chat

* `/join <room>` - Join a specific room (defaults to `general` on login).
* `/create-room <name> [description]` - Create a new room with an optional description.
* `/rooms` - List all available rooms and their active user count.
* `/history [limit]` - Fetch the latest messages from the current room (default limit: 50).

### Users

* `/dm <username> <message>` - Send a private direct message.
* `/online` - List all currently connected users.
* `/quit` - Quit the application.
* `/help` - Show the available commands.

---

## 🔒 Protocol Structure

WireChat uses a simple JSON-based packet protocol over WebSockets. Here are some examples:

### Message Packet

```json
{
    "type": "message",
    "content": "Hello everyone"
}
```

### Command Packet (e.g. DM)

```json
{
    "type": "command",
    "command": "dm",
    "target": "Alice",
    "content": "Hi there!"
}
```

---

## 🛠️ Technologies Used

**Server:**

* `Node.js`
* `ws` (WebSockets)
* `node:sqlite` (Database)
* `argon2` (Password Hashing)

**Client:**

* `blessed` (Terminal UI)
* `chalk` (Terminal Styling)
* `ws` (WebSockets)

---

## 🎨 Design Decisions

### Why WebSockets?

For a real-time, high-frequency messaging application, low-latency, bidirectional, and full-duplex communication is vital. Traditional web communication relies on HTTP polling or Long Polling, which introduce excessive latency and huge network overhead because each update request has to transmit verbose HTTP headers and re-negotiate TCP handshakes. While Server-Sent Events (SSE) offer server-to-client pushing, they are strictly unidirectional. WebSockets (implemented via the Node.js `ws` library) solve these issues by establishing a persistent, stateful TCP connection using a single handshake. Once connected, data frames are sent with minimal header wrapping (often just 2–10 bytes), enabling real-time messaging with latency under 10ms.

### Why SQLite?

A primary goal of WireChat was portability and developer ergonomics. Heavyweight relational databases like PostgreSQL or MySQL introduce deployment friction (requiring daemon setups, configuring credentials, managing users, and running heavy background processes). SQLite, in contrast, is a serverless, zero-configuration database that stores the entire database within a single local file (`chat.db`). Furthermore, Node.js 22+ introduces a native, built-in synchronous database driver (`node:sqlite`). This eliminates the need for compiling third-party bindings like `sqlite3` via node-gyp, resulting in faster and more reliable installations. SQLite easily handles prepared queries for user accounts, credentials matching, and messages indexing at speed.

### Why Terminal UI (TUI) instead of Web UI?

Choosing a terminal-based interface over a browser web page was based on three priorities:

1. **Developer-First Ergonomics:**  Command-line interfaces (CLIs) are the native home for software developers and sysadmins. An interactive terminal UI fits the developer workflow perfectly, offering quick keyboard shortcuts without context-switching to a heavy browser.
2. **Minimal Footprint:** Web apps consume significant RAM and CPU cycle overhead due to rendering engines, DOM structures, and bundle parsing. A terminal-based application loads instantly, uses single-digit megabytes of memory, and requires zero GUI compilation assets.
3. **Engineering Challenge:** Designing an interactive UI in a monospace grid using the `blessed` library requires dealing directly with low-level inputs, stdout redraw loops, text wrapping constraints, terminal resize signals, and custom ANSI color escapes. This provided a richer, deeper systems-focused programming challenge than simple HTML/CSS template editing.

### Why Argon2 for passwords?

Password database security is vital. Conventional hashing algorithms like MD5 or SHA-256 are too computationally cheap, making them extremely vulnerable to GPU- or ASIC-accelerated brute-force attacks. Even standard modern options like `bcrypt` are slowly showing their age compared to newer methods. WireChat utilizes **Argon2** (the winner of the Password Hashing Competition), which is a memory-hard and time-hard algorithm. By tuning its memory costs, time parameters, and degree of parallelism, it secures stored credentials against custom hardware cracker clusters. Utilizing the `argon2` npm library guarantees robust cryptographical hashing for our database storage.

---

## 🧠 Challenges Faced

### Designing Packet Protocol

Because WebSockets only facilitate the transmission of raw string or binary payloads, we had to implement a custom application-level serialization protocol. We needed distinct packet schemas for user logins, system announcements, private DMs, message broadcasts, and history requests. This was resolved by standardizing on a JSON-based protocol (e.g. `{ type: "message", content: "..." }`). The major challenge was handling invalid packet formatting or malicious payloads. Without strict server-side validation, a corrupt payload would crash the event loop. We implemented a unified validator (`shared/validator.js`) that enforces min/max length constraints on usernames and messages, verifies data types, and gracefully rejects malformed packets without dropping client connections.

### Managing Multiple Clients

The WebSocket server operates as a single-threaded event loop, which must multiplex incoming messages from dozens of active clients concurrently. The server has to map socket instances to authenticated usernames and keep track of online users. Because users can close their terminals unexpectedly or drop connections due to network outages, we had to monitor socket lifecycles carefully. We solved this by using Javascript maps to link sockets and usernames, and attaching handlers to the socket's `close` event to purge orphaned sessions, garbage-collect memory, and broadcast system notifications (e.g. `[SYSTEM] Alice left general`) to prevent ghost user listings.

### Maintaining Room State

Unlike advanced wrapper libraries like Socket.IO, the base Node.js `ws` library has no concept of "rooms" or "channels". We had to implement our own in-memory room routing mechanism. The server maintains a room mapping containing participant lists. When a user executes a `/join <room>` command, the server must atomically remove their socket from the current room's registry, add it to the target room's registry, and broadcast updates. Keeping client UI labels (e.g., room name and user counts) synchronized with server-side collections required careful asynchronous event handling and UI redraw orchestration.

### Persistent History Implementation

Displaying a historical backlog when joining a room is essential for context, but loading a database log of thousands of messages could easily lock the single-threaded server and overflow the terminal UI log buffer. We addressed this by querying the SQLite database with `ORDER BY timestamp DESC LIMIT ?` to fetch only a configurable number of records. However, this fetches the messages in reverse order (newest first), whereas chat logs need to be printed chronologically (oldest first). We solved this by reversing the fetched array dynamically in memory on the server before wrapping it inside a `history` JSON packet and transmitting it back to the client.

---

## 🚀 Future Improvements

* **End-to-End Encryption (E2EE):** Implementing the Double Ratchet or Diffie-Hellman key exchange protocols to encrypt direct messages between clients, ensuring the server acts only as a relay and cannot inspect chat content.
* **File Transfer:** Supporting base64 chunking of local files so users can securely transfer documents, scripts, and logs directly through the terminal UI.
* **Friend System:** Expanding the SQLite schema to include user relationship tables, allowing users to send requests, block users, and see real-time notifications when their friends come online.
* **Message Reactions:** Adding database models and blessed render nodes to display emoji reactions on messages.
* **Docker Deployment:** Creating a multi-container `docker-compose.yml` file to package the server and clients into isolated, reproducible, and ready-to-deploy environments.

---

## 👨‍💻 Author

**Lokesh Kumar** - [@lokeshkrio](https://github.com/lokeshkrio)
*Computer Science Student interested in Systems Programming, Backend Engineering, Distributed Systems, and Quantitative Finance.*

---

## 📄 License

This project is licensed under the MIT License.
