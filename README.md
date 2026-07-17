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

## 👨‍💻 Author

**Lokesh Kumar** - [@lokeshkrio](https://github.com/lokeshkrio)
*Computer Science Student interested in Systems Programming, Backend Engineering, Distributed Systems, and Quantitative Finance.*

---

## 📄 License

This project is licensed under the MIT License.
