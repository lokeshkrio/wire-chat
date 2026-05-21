// Join Handler Module
import { createSystemPacket } from "../../../shared/protocol.js";
import { broadcast } from "../services/broadcast.js";

export function handleJoin(ws, packet, users) {
  if (users.has(packet.username)) {
    ws.send(
      JSON.stringify({
        type: "error",
        content: "Username already taken",
      }),
    );

    return;
  }

  ws.username = packet.username;

  users.set(ws.username, ws);

  console.log(`${ws.username} joined`);

  const systemPacket = createSystemPacket(`${ws.username} joined`);

  broadcast(users, systemPacket);
}
