import WebSocket from "ws";
import readline from "readline";
import chalk from "chalk";
import { createMessagePacket, isCommand } from "../shared/protocol.js";

const ws = new WebSocket("ws://127.0.0.1:5000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let username = "";
let connection = false;

function main(conn) {
  if (conn) {
    console.log(chalk.green(`[SYS]:Connecting as ${username}`));

    ws.on("message", (message) => {
      const packet = JSON.parse(message.toString());

      // USER MESSAGE
      if (packet.type === "message") {
        console.log(chalk.cyan(`${packet.username}: ${packet.content}`));
      }

      // SYSTEM MESSAGE
      if (packet.type === "system") {
        console.log(chalk.yellow(`[SYSTEM]: ${packet.content}`));
      }
      if (packet.type === "error") {
        console.log(chalk.red("[SYSTEM]", packet.content));
        process.exit();
      }
    });

    ws.on("error", (err) => {
      console.log(chalk.red(err.message));
    });
  }
}

ws.on("open", () => {
  rl.question("Enter username: ", (name) => {
    username = name;

    // IDENTITY PACKET
    ws.send(
      JSON.stringify({
        type: "message",
        username,
        content: "joined",
      }),
    );

    connection = true;
    main(connection);

    // CHAT INPUT
    rl.on("line", (input) => {
      let cmd = isCommand(input);

      if (cmd != false) {
        if (cmd.command != "dm") {
          console.log(`${cmd.command} ${cmd.arg} ${cmd.content}`);
        }
        if (cmd.command == "dm") {
          console.log(`${cmd.arg} ${cmd.content}`);

          const packet = {
            type: "command",
            command: cmd.command,
            arg: cmd.arg,
            content: cmd.content,
          };
          // const packet = createMessagePacket(input);

          ws.send(JSON.stringify(packet));
        }
      } else {
        const packet = createMessagePacket(input);

        ws.send(JSON.stringify(packet));
      }
    });
  });
});
