import { logMessage } from "../../modules/logger.js";
import { broadcastToRoom } from "../services/broadcast.js";
import { insertMessage } from "../services/database.js";

/**
 * Handles incoming chat messages from a client.
 * Validates the user's state, logs the message, stores it in the database,
 * and broadcasts it to all other users in the same room.
 *
 * @param {WebSocket} ws - The client's websocket connection
 * @param {Object} packet - The parsed message packet
 * @param {Map} users - Global map of online users
 * @param {Map} rooms - Global map of active rooms
 */
export function handleMessage(ws, packet, users, rooms) {
  // Ensure the user is logged in and has joined a room before allowing them to send messages
  if (!ws.username || !ws.room) {
    ws.send(JSON.stringify({ type: "error", content: "You must be authenticated and in a room to send messages" }));
    return;
  }

  // Construct the outgoing message packet with a server-side timestamp
  const outgoingPacket = {
    type: "message",
    username: ws.username,
    room: ws.room,
    content: packet.content,
    timestamp: Date.now(),
  };

  // Log the message to the server console/logfile
  logMessage(`[${ws.room}] ${ws.username}: ${packet.content}`);
  
  // Persist the message to the SQLite database for history retrieval
  insertMessage(ws.room, ws.username, packet.content, outgoingPacket.timestamp);

  // Broadcast the message to all users in the current room
  broadcastToRoom(ws.room, rooms, outgoingPacket);
}
