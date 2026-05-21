import { logMessage } from "../../modules/logger.js";

import { broadcastToRoom } from "../services/broadcast.js";

export function handleMessage(ws, packet, users, rooms) {
  const outgoingPacket = {
    type: "message",
    username: ws.username,
    room: ws.room,
    content: packet.content,
    timestamp: Date.now(),
  };

  logMessage(`[${ws.room}] ${ws.username}: ${packet.content}`);

  broadcastToRoom(ws.room, rooms, outgoingPacket);
}
