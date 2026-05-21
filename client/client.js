import WebSocket from "ws";
import readline from "readline";
import chalk from "chalk";

import {
  createMessagePacket,
} from "../shared/protocol.js";

const ws = new WebSocket(
  "ws://127.0.0.1:5000"
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let username = "";

ws.on("open", () => {

  rl.question(
    "Enter username: ",
    (name) => {

      username = name;

      // JOIN PACKET
      ws.send(
        JSON.stringify({
          type: "join",
          username,
        })
      );

      console.log(
        chalk.green(
          `Connected as ${username}`
        )
      );

      // INPUT LISTENER
      rl.on("line", (input) => {

        // COMMANDS
        if (
          input.startsWith("/")
        ) {

          const parts =
            input.split(" ");

          const command =
            parts[0].slice(1);

          // DM COMMAND
          if (
            command === "dm"
          ) {

            const target =
              parts[1];

            const content =
              parts
                .slice(2)
                .join(" ");

            const packet = {
              type: "command",
              command: "dm",
              target,
              content,
            };

            ws.send(
              JSON.stringify(packet)
            );

            return;
          }

          // HELP COMMAND
          if (
            command === "help"
          ) {

            console.log(`
Available Commands:

/dm <user> <message>
/help
            `);

            return;
          }

        }

        // NORMAL MESSAGE
        const packet =
          createMessagePacket(
            input
          );

        ws.send(
          JSON.stringify(packet)
        );

      });

    }
  );

});

// RECEIVE PACKETS
ws.on("message", (message) => {

  const packet = JSON.parse(
    message.toString()
  );

  // NORMAL MESSAGE
  if (
    packet.type === "message"
  ) {

    console.log(
      chalk.cyan(
        `${packet.username}: ${packet.content}`
      )
    );

  }

  // SYSTEM MESSAGE
  if (
    packet.type === "system"
  ) {

    console.log(
      chalk.yellow(
        `[SYSTEM] ${packet.content}`
      )
    );

  }

  // DM MESSAGE
  if (
    packet.type === "dm"
  ) {

    console.log(
      chalk.magenta(
        `[DM] ${packet.from}: ${packet.content}`
      )
    );

  }

  // ERROR
  if (
    packet.type === "error"
  ) {

    console.log(
      chalk.red(
        `[ERROR] ${packet.content}`
      )
    );

  }

});

ws.on("error", (err) => {

  console.log(
    chalk.red(err.message)
  );

});