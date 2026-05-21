// Broadcasting Module

import WebSocket from "ws";

export function broadcastToRoom(room, rooms, packet) {
  const roomUsers = rooms.get(room);

  if (!roomUsers) {
    return;
  }

  roomUsers.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(packet));
    }
  });
}
