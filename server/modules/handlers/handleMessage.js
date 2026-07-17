import { logMessage } from "../../modules/logger.js";
<<<<<<< HEAD
import { broadcastToRoom } from "../services/broadcast.js";
import { insertMessage } from "../services/database.js";

export function handleMessage(ws, packet, users, rooms) {
  if (!ws.username || !ws.room) {
    ws.send(JSON.stringify({ type: "error", content: "You must be authenticated and in a room to send messages" }));
    return;
  }

=======

import { broadcastToRoom } from "../services/broadcast.js";

export function handleMessage(ws, packet, users, rooms) {
>>>>>>> d0911ed8ff905d31466ecdbe262c65348d4af6ab
  const outgoingPacket = {
    type: "message",
    username: ws.username,
    room: ws.room,
    content: packet.content,
    timestamp: Date.now(),
  };

  logMessage(`[${ws.room}] ${ws.username}: ${packet.content}`);
<<<<<<< HEAD
  insertMessage(ws.room, ws.username, packet.content, outgoingPacket.timestamp);
=======
>>>>>>> d0911ed8ff905d31466ecdbe262c65348d4af6ab

  broadcastToRoom(ws.room, rooms, outgoingPacket);
}
