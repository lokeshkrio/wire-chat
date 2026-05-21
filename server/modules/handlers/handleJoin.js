// Join Handler Module

import { createSystemPacket } from "../../../shared/protocol.js";

import { broadcastToRoom } from "../services/broadcast.js";

export function handleJoin(ws, packet, users, rooms) {
  if (users.has(packet.username)) {
    ws.send(
      JSON.stringify({
        type: "error",
        content: "Username already taken",
      }),
    );

    return;
  }

  ws.username = packet.username;

  ws.room = "general";

  users.set(ws.username, ws);

  if (!rooms.has("general")) {
    rooms.set("general", new Set());
  }

  rooms.get("general").add(ws);

  const systemPacket = createSystemPacket(`${ws.username} joined general`);

  broadcastToRoom("general", rooms, systemPacket);
}
