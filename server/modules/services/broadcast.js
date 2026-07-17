// Broadcasting Module

import WebSocket from "ws";

export function broadcastToRoom(room, rooms, packet) {
<<<<<<< HEAD
  const roomData = rooms.get(room);

  if (!roomData || !roomData.users) {
    return;
  }

  roomData.users.forEach((socket) => {
=======
  const roomUsers = rooms.get(room);

  if (!roomUsers) {
    return;
  }

  roomUsers.forEach((socket) => {
>>>>>>> d0911ed8ff905d31466ecdbe262c65348d4af6ab
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(packet));
    }
  });
}
