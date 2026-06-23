import WebSocket from "ws";
import readline from "readline";
import chalk from "chalk";

import { createMessagePacket } from "../shared/protocol.js";

const ws = new WebSocket("ws://127.0.0.1:5000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let username = "";

ws.on("open", () => {
  rl.question("Enter username: ", (name) => {
    username = name;

    // JOIN PACKET
    ws.send(
      JSON.stringify({
        type: "join",
        username,
      }),
    );

    console.log(chalk.green(`Connected as ${username}`));

    rl.on("line", (input) => {
      // COMMANDS
      if (input.startsWith("/")) {
        const parts = input.split(" ");

        const command = parts[0].slice(1);

        // DM
        if (command === "dm") {
          const target = parts[1];

          const content = parts.slice(2).join(" ");

          const packet = {
            type: "command",
            command: "dm",
            target,
            content,
          };

          ws.send(JSON.stringify(packet));

          return;
        }

        // JOIN ROOM
        if (command === "join") {
          const target = parts[1];

          const packet = {
            type: "command",
            command: "join",
            target,
          };

          ws.send(JSON.stringify(packet));

          return;
        }

        // ONLINE USERS
        if (command === "online") {
          const packet = {
            type: "command",
            command: "online",
          };

          ws.send(JSON.stringify(packet));

          return;
        }

        // HELP
        if (command === "help") {
          console.log(
            `\nAvailable Commands:\n\n/dm <user> <message>\n/join <room>\n/online\n/help\n`,
          );

          return;
        }
      }

      // NORMAL MESSAGE
      const packet = createMessagePacket(input);

      ws.send(JSON.stringify(packet));
    });
  });
});

// RECEIVE PACKETS
ws.on("message", (message) => {
  const packet = JSON.parse(message.toString());

  // NORMAL MESSAGE
  if (packet.type === "message") {
    const time = new Date(packet.timestamp).toLocaleTimeString();

    console.log(
      chalk.cyan(
        `[${packet.room}] ${packet.username}: ${packet.content} (${time})`,
      ),
    );
  }

  // SYSTEM
  if (packet.type === "system") {
    console.log(chalk.yellow(`[SYSTEM] ${packet.content}`));
  }

  // DM
  if (packet.type === "dm") {
    const time = new Date(packet.timestamp).toLocaleTimeString();

    console.log(
      chalk.magenta(`[DM] ${packet.from}: ${packet.content} (${time})`),
    );
  }

  // ERROR
  if (packet.type === "error") {
    console.log(chalk.red(`[ERROR] ${packet.content}`));
  }
});

ws.on("error", (err) => {
  console.log(chalk.red(err.message));
});
