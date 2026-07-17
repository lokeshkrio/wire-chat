# Wire Chat

A lightweight real-time terminal chat application built with **Node.js** and **WebSockets**.
Wire Chat provides room-based messaging, private messages, user management, and packet validation through a simple custom protocol.

---

## Features

* Real-time communication using WebSockets
* Multiple chat rooms
* Private messaging (DM)
* Username uniqueness enforcement
* Packet validation
* System notifications
* Online user listing
* Message logging
* Modular architecture

---

## Project Structure

```
wire-chat/
│
├── client/
│   ├── client.js
│   └── modules/
│       └── cmdAction.js
│
├── server/
│   ├── server.js
│   └── modules/
│       ├── handlers/
│       │   ├── handleJoin.js
│       │   ├── handleMessage.js
│       │   └── handleCmd.js
│       │
│       ├── services/
│       │   └── broadcast.js
│       │
│       └── logger.js
│
├── shared/
│   ├── protocol.js
│   ├── validator.js
│   └── commands.js
│
├── LICENSE
└── README.md
```

---

## Architecture

```
        Client A
           │
           │
      WebSocket
           │
 ┌──────────────────┐
 │    Wire Server   │
 └──────────────────┘
      │         │
      │         │
 Client B    Client C
```

The server maintains:

* Connected users
* Active rooms
* Message broadcasting
* Command handling
* Packet validation

---

## Installation

### Clone the repository

```bash
<<<<<<< HEAD
git clone https://github.com/lokeshkrio/wire-chat.git
=======
git clone https://github.com/<username>/wire-chat.git
>>>>>>> d0911ed8ff905d31466ecdbe262c65348d4af6ab

cd wire-chat
```

---

### Install dependencies

#### Server

```bash
cd server
npm install
```

#### Client

```bash
cd ../client
npm install
```

---

## Running

### Start the server

```bash
cd server
node server.js
```

Output:

```text
Wire server running
```

---

### Start a client

Open another terminal:

```bash
cd client
node client.js
```

Enter a username when prompted:

```text
Enter username: Lokesh
Connected as Lokesh
```

Run multiple clients in separate terminals to chat.

---

## Supported Commands

### Direct Message

```text
/dm <username> <message>
```

Example:

```text
/dm Alice Hello!
```

---

### Show Help

```text
/help
```

Displays available commands.

---

### Online Users

```text
/online
```

Returns the list of connected users.

---

### Join Room

Packet command:

```javascript
{
    type: "command",
    command: "join",
    target: "sports"
}
```

Moves the user to another room.

---

## Protocol

### Join Packet

```javascript
{
    type: "join",
    username: "Lokesh"
}
```

---

### Message Packet

```javascript
{
    type: "message",
    content: "Hello everyone"
}
```

---

### Command Packet

```javascript
{
    type: "command",
    command: "dm",
    target: "Alice",
    content: "Hi!"
}
```

---

### System Packet

```javascript
{
    type: "system",
    content: "User joined general"
}
```

---

### DM Packet

```javascript
{
    type: "dm",
    from: "Lokesh",
    content: "Hello",
    timestamp: 1710000000
}
```

---

## Validation Rules

### Username

* Minimum length: 2 characters
* Maximum length: 20 characters
* Must be unique

### Message

* Cannot be empty
* Maximum length: 500 characters

### Commands

* Must contain a valid command string

---

## Technologies Used

* Node.js
* WebSocket (`ws`)
* Chalk
* Readline

---

## Future Improvements

* Authentication
* Persistent chat history
* Password-protected rooms
* End-to-end encryption
* File transfer
* Message reactions
* Typing indicators
* User presence status
* Rate limiting
* Web frontend

---

## License

This project is licensed under the MIT License.

---

## Author

**Lokesh Kumar**[github.com/lokeshkrio] @ 2026

Computer Science Student interested in

* Systems Programming
* Backend Engineering
* Distributed Systems
* Quantitative Finance

---
