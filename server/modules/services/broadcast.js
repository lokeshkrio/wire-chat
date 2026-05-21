// Broadcasting Module

export function broadcast(users, pkt) {
  users.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(pkt));
    }
  });
}
