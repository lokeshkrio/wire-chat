import { logMessage } from "../../modules/logger.js";
import { broadcastToRoom } from "../services/broadcast.js";
import { insertMessage } from "../services/database.js";

export function handleMessage(ws, packet, users, rooms) {
  if (!ws.username || !ws.room) {
    ws.send(JSON.stringify({ type: "error", content: "You must be authenticated and in a room to send messages" }));
    return;
  }

  const outgoingPacket = {
    type: "message",
    username: ws.username,
    room: ws.room,
    content: packet.content,
    timestamp: Date.now(),
  };

  logMessage(`[${ws.room}] ${ws.username}: ${packet.content}`);
  insertMessage(ws.room, ws.username, packet.content, outgoingPacket.timestamp);

  broadcastToRoom(ws.room, rooms, outgoingPacket);
}
