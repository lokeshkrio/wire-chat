export function validatePacket(
  packet
) {

  // MUST HAVE TYPE
  if (!packet.type) {
    return false;
  }

  // JOIN VALIDATION
  if (
    packet.type === "join"
  ) {

    if (
      typeof packet.username !==
      "string"
    ) {
      return false;
    }

    if (
      packet.username.length < 2 ||
      packet.username.length > 20
    ) {
      return false;
    }

  }

  // MESSAGE VALIDATION
  if (
    packet.type === "message"
  ) {

    if (
      typeof packet.content !==
      "string"
    ) {
      return false;
    }

    if (
      packet.content.length === 0 ||
      packet.content.length > 500
    ) {
      return false;
    }

  }

  // COMMAND VALIDATION
  if (
    packet.type === "command"
  ) {

    if (
      typeof packet.command !==
      "string"
    ) {
      return false;
    }

  }

  return true;

}