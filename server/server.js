import WebSocket, { WebSocketServer } from "ws";
import { createSystemPacket } from "../shared/protocol.js";
import { validatePacket } from "../shared/validator.js";
import { logMessage } from "./modules/logger.js";

const wss = new WebSocketServer({
  port: 5000,
});

const clients = new Set();
const usernames = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected");

  clients.add(ws);

  ws.username = null;

  ws.on("message", (message) => {
    const packet = JSON.parse(message.toString());

    // PACKET VALIDATION
    if (!validatePacket(packet)) {
      console.log("Invalid packet rejected");

      return;
    }

    // username varification
    if (usernames.has(packet.username)) {
      ws.send(
        JSON.stringify({
          type: "error",
          content: "Username already taken",
        }),
      );

      return false;
    }

    // FIRST PACKET = USER IDENTITY
    if (!ws.username) {
      usernames.add(packet.username);
      ws.username = packet.username;

      console.log(`${ws.username} joined`);
      const systemPacket = createSystemPacket(`${ws.username} joined Wire`);
      logMessage(`${ws.username} joined`);

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(systemPacket));
        }
      });

      return;
    }

    // MESSAGE PACKETS
    if (packet.type === "message") {
      packet["username"] = ws.username;
      logMessage(packet.username + ": " + packet.content);

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(packet));
        }
      });
    }
    if (packet.type === "command") {
      packet["username"] = ws.username;
      logMessage(packet.username + ": " + packet.arg + packet.content);

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(packet));
        }
      });
    }
  });

  ws.on("close", () => {
    clients.delete(ws);

    console.log("Client disconnected");

    if (ws.username) {
      const systemPacket = createSystemPacket(`${ws.username} left Wire`);
      usernames.delete(ws.username);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(systemPacket));
        }
      });
    }
  });
});

console.log("Wire server running on ws://localhost:5000");
