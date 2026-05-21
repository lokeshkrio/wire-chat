import { broadcast } from "../services/broadcast.js";

import { logMessage } from "../logger.js";

export function handleMessage(ws, packet, users) {
  const outgoingPacket = {
    type: "message",
    username: ws.username,
    content: packet.content,
  };

  logMessage(`${ws.username}: ${packet.content}`);

  broadcast(users, outgoingPacket);
}
