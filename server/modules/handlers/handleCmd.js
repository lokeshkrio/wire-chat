import {
  createSystemPacket,
} from "../../../shared/protocol.js";
import { getHistory } from "../services/database.js";

import {
  broadcastToRoom,
} from "../services/broadcast.js";

export function handleCommand(
  ws,
  packet,
  users,
  rooms
) {

  // DM
  if (
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
      timestamp: Date.now(),
    };

    targetSocket.send(
      JSON.stringify(dmPacket)
    );

    return;
  }

  // JOIN ROOM
  if (
    packet.command === "join"
  ) {

    const newRoom =
      packet.target;

    // REMOVE FROM OLD ROOM
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).users.delete(ws);
    }

    // CREATE ROOM IF DOES NOT EXIST
    if (!rooms.has(newRoom)) {
      rooms.set(newRoom, { users: new Set(), description: "No description provided." });
    }

    // JOIN NEW ROOM
    rooms.get(newRoom).users.add(ws);

    ws.room = newRoom;

    const systemPacket =
      createSystemPacket(
        `${ws.username} joined ${newRoom}`
      );

    broadcastToRoom(
      newRoom,
      rooms,
      systemPacket
    );

    return;
  }

  // ONLINE USERS
  if (packet.command === "online") {
    const onlineUsers = [...users.keys()];
    ws.send(JSON.stringify({ type: "system", content: `Online: ${onlineUsers.join(", ")}` }));
    return;
  }

  // CREATE ROOM
  if (packet.command === "create-room") {
    const { name, description } = packet;
    if (!name) return;
    
    if (rooms.has(name)) {
      rooms.get(name).description = description || "No description provided.";
    } else {
      rooms.set(name, { users: new Set(), description: description || "No description provided." });
    }
    
    ws.send(JSON.stringify({ type: "system", content: `Room '${name}' created/updated.` }));
    return;
  }

  // LIST ROOMS
  if (packet.command === "rooms") {
    const roomList = [];
    for (const [name, data] of rooms.entries()) {
      roomList.push({ name, description: data.description, users: data.users.size });
    }
    ws.send(JSON.stringify({ type: "rooms_list", rooms: roomList }));
    return;
  }

  // HISTORY
  if (packet.command === "history") {
    if (!ws.room) {
      ws.send(
        JSON.stringify({
          type: "error",
          content: "You must be in a room to view history",
        })
      );
      return;
    }

    const limit = parseInt(packet.limit, 10) || 50;
    
    getHistory(ws.room, limit)
      .then((messages) => {
        ws.send(
          JSON.stringify({
            type: "history",
            messages,
          })
        );
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        ws.send(
          JSON.stringify({
            type: "error",
            content: "Failed to fetch history",
          })
        );
      });

    return;
  }

}