import WebSocket, {
  WebSocketServer,
} from "ws";

import {
  createSystemPacket,
} from "../shared/protocol.js";

import {
  validatePacket,
} from "../shared/validator.js";

import {
  logMessage,
} from "./modules/logger.js";

const wss = new WebSocketServer({
  port: 5000,
});

// USERNAME -> SOCKET
const users = new Map();

wss.on("connection", (ws) => {

  console.log("Client connected");

  ws.username = null;

  ws.on("message", (message) => {

    const packet = JSON.parse(
      message.toString()
    );

    // VALIDATION
    if (!validatePacket(packet)) {

      console.log(
        "Invalid packet rejected"
      );

      return;
    }

    // AUTH / FIRST JOIN
    if (!ws.username) {

      if (
        users.has(packet.username)
      ) {

        ws.send(
          JSON.stringify({
            type: "error",
            content:
              "Username already taken",
          })
        );

        return;
      }

      ws.username = packet.username;

      users.set(
        ws.username,
        ws
      );

      console.log(
        `${ws.username} joined`
      );

      const systemPacket =
        createSystemPacket(
          `${ws.username} joined Wire`
        );

      broadcast(systemPacket);

      return;
    }

    // NORMAL MESSAGE
    if (packet.type === "message") {

      const outgoingPacket = {
        type: "message",
        username: ws.username,
        content: packet.content,
      };

      logMessage(
        `${ws.username}: ${packet.content}`
      );

      broadcast(outgoingPacket);

    }

    // DIRECT MESSAGE
    if (
      packet.type === "command" &&
      packet.command === "dm"
    ) {

      const targetSocket =
        users.get(packet.target);

      if (!targetSocket) {

        ws.send(
          JSON.stringify({
            type: "error",
            content:
              "User not found",
          })
        );

        return;
      }

      const dmPacket = {
        type: "dm",
        from: ws.username,
        content: packet.content,
      };

      targetSocket.send(
        JSON.stringify(dmPacket)
      );

      ws.send(
        JSON.stringify({
          type: "system",
          content:
            `DM sent to ${packet.target}`,
        })
      );

    }

  });

  ws.on("close", () => {

    if (ws.username) {

      users.delete(
        ws.username
      );

      const systemPacket =
        createSystemPacket(
          `${ws.username} left Wire`
        );

      broadcast(systemPacket);

    }

    console.log(
      "Client disconnected"
    );

  });

});

// BROADCAST HELPER
function broadcast(packet) {

  users.forEach((clientSocket) => {

    if (
      clientSocket.readyState ===
      WebSocket.OPEN
    ) {

      clientSocket.send(
        JSON.stringify(packet)
      );

    }

  });

}

console.log(
  "Wire server running on ws://localhost:5000"
);