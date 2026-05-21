import { randomUUID } from "crypto";
import { commands } from "./commands.js";
import { log } from "console";

export function createMessagePacket(content) {
  return {
    type: "message",
    content,
  };
}

export function createSystemPacket(content) {
  return {
    type: "system",
    content: content,
  };
}

export function isCommand(input) {
  if (input.startsWith("/")) {
    const parts = input.split(" ");
    const command = parts[0].slice(1);
    const arg = parts[1];
    const content = parts.slice(2).join(" ");
    log(command, arg, content);
    if (commands.includes(command)) {
      return {
        command,
        arg,
        content,
      };
    } else {
      return false;
    }
  } else {
    return false;
  }
}
