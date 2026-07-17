// Broadcasting Module

import WebSocket from "ws";

export function broadcastToRoom(room, rooms, packet) {
  const roomData = rooms.get(room);

  if (!roomData || !roomData.users) {
    return;
  }

  roomData.users.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(packet));
    }
  });
}
