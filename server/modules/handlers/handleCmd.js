import {
  createSystemPacket,
} from "../../../shared/protocol.js";

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
    if (
      rooms.has(ws.room)
    ) {

      rooms
        .get(ws.room)
        .delete(ws);

    }

    // CREATE ROOM
    if (
      !rooms.has(newRoom)
    ) {

      rooms.set(
        newRoom,
        new Set()
      );

    }

    // JOIN NEW ROOM
    rooms
      .get(newRoom)
      .add(ws);

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
  if (
    packet.command === "online"
  ) {

    const onlineUsers = [
      ...users.keys(),
    ];

    ws.send(
      JSON.stringify({
        type: "system",
        content:
          `Online: ${onlineUsers.join(", ")}`,
      })
    );

  }

}