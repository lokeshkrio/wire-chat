import WebSocket, { WebSocketServer } from "ws";

import { validatePacket } from "../shared/validator.js";

import { handleJoin } from "./modules/handlers/handleJoin.js";

import { handleMessage } from "./modules/handlers/handleMessage.js";

import { handleCommand } from "./modules/handlers/handleCmd.js";

const wss = new WebSocketServer({
  port: 5000,
});

const users = new Map();

const handlers = {
  join: handleJoin,
  message: handleMessage,
  command: handleCommand,
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.username = null;

  ws.on("message", (message) => {
    const packet = JSON.parse(message.toString());

    if (!validatePacket(packet)) {
      console.log("Invalid packet");

      return;
    }

    const handler = handlers[packet.type];

    if (!handler) {
      console.log("Unknown packet type");

      return;
    }

    handler(ws, packet, users);
  });
});

console.log("Wire server running");
