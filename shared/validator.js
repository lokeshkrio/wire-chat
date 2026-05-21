export function validatePacket(packet) {
  if (!packet.type) {
    return false;
  }

  if (packet.type === "message") {
    if (
      // !packet.username ||
      !packet.content
    ) {
      return false;
    }
  }

  return true;
}
