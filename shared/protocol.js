export function createMessagePacket(
  content
) {

  return {
    type: "message",
    content,
  };

}

export function createSystemPacket(
  content
) {

  return {
    type: "system",
    content,
  };

}