export function handleCommand(ws, packet, users) {
  // DM COMMAND
  if (packet.command === "dm") {
    const targetSocket = users.get(packet.target);

    if (!targetSocket) {
      ws.send(
        JSON.stringify({
          type: "error",
          content: "User not found",
        }),
      );

      return;
    }

    const dmPacket = {
      type: "dm",
      from: ws.username,
      content: packet.content,
    };

    targetSocket.send(JSON.stringify(dmPacket));
  }
}
