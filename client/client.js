import WebSocket from "ws";
<<<<<<< HEAD
import chalk from "chalk";
import blessed from "blessed";
import { createMessagePacket } from "../shared/protocol.js";

const ws = new WebSocket("ws://127.0.0.1:5051");

const screen = blessed.screen({
  smartCSR: true,
  title: "Wire Chat"
});

screen.key(['escape', 'C-c'], function(ch, key) {
  return process.exit(0);
});

let isConnected = false;
ws.on('open', () => {
  isConnected = true;
});

let username = "";
let currentRoom = "";

const chatBox = blessed.log({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%-3',
  border: { type: 'line' },
  label: ' User: (Not Logged In) | Room: (None) ',
  tags: true,
  scrollback: 1000,
  scrollbar: { ch: ' ', track: { bg: 'cyan' }, style: { inverse: true } }
});

const inputBox = blessed.textbox({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  border: { type: 'line' },
  inputOnFocus: true,
  style: { fg: 'white', focus: { border: { fg: 'cyan' } } }
});

inputBox.focus();

chatBox.log(`{cyan-fg}Welcome to Wire Chat!{/cyan-fg}`);
chatBox.log(`{gray-fg}Please authenticate first:{/gray-fg}`);
chatBox.log(`{gray-fg}/register <username> <password>{/gray-fg}`);
chatBox.log(`{gray-fg}/login <username> <password>{/gray-fg}\n`);
screen.render();

inputBox.on('submit', (input) => {
  inputBox.clearValue();
  inputBox.focus();
  screen.render();

  if (!input.trim()) return;

  if (!isConnected) {
    chatBox.log(`{yellow-fg}[SYSTEM] Connecting to server... please wait.{/yellow-fg}`);
    return;
  }

  const parts = input.trim().split(" ");
  
  if (input.startsWith("/")) {
    const command = parts[0].slice(1);

    if (command === "register") {
      const u = parts[1];
      const p = parts[2];
      if (!u || !p) {
        chatBox.log(`{red-fg}[ERROR] Usage: /register <username> <password>{/red-fg}`);
        return;
      }
      ws.send(JSON.stringify({ type: "register", username: u, password: p }));
      return;
    }

    if (command === "login") {
      const u = parts[1];
      const p = parts[2];
      if (!u || !p) {
        chatBox.log(`{red-fg}[ERROR] Usage: /login <username> <password>{/red-fg}`);
        return;
      }
      ws.send(JSON.stringify({ type: "login", username: u, password: p }));
      return;
    }

    if (!username) {
      chatBox.log(`{red-fg}[ERROR] You must be logged in to use commands!{/red-fg}`);
      return;
    }

    if (command === "dm") {
      const target = parts[1];
      const content = parts.slice(2).join(" ");
      ws.send(JSON.stringify({ type: "command", command: "dm", target, content }));
      return;
    }

    if (command === "join") {
      const target = parts[1];
      if (target) {
        ws.send(JSON.stringify({ type: "command", command: "join", target }));
      }
      return;
    }

    if (command === "create-room") {
      const name = parts[1];
      const description = parts.slice(2).join(" ");
      if (name) {
        ws.send(JSON.stringify({ type: "command", command: "create-room", name, description }));
      } else {
        chatBox.log(`{red-fg}Usage: /create-room <name> [description]{/red-fg}`);
      }
      return;
    }

    if (command === "rooms") {
      ws.send(JSON.stringify({ type: "command", command: "rooms" }));
      return;
    }

    if (command === "online") {
      ws.send(JSON.stringify({ type: "command", command: "online" }));
      return;
    }

    if (command === "history") {
      const limit = parts[1] || 50;
      ws.send(JSON.stringify({ type: "command", command: "history", limit }));
      return;
    }

    if (command === "help") {
      chatBox.log(`\n{cyan-fg}Available Commands:{/cyan-fg}\n/dm <user> <msg>\n/join <room>\n/create-room <name> [desc]\n/rooms\n/history [limit]\n/online\n/help\n`);
      return;
    }
  } else {
    if (!username) {
      chatBox.log(`{red-fg}[ERROR] You must be logged in to chat!{/red-fg}`);
      return;
    }
    const packet = createMessagePacket(input);
    ws.send(JSON.stringify(packet));
  }
});

inputBox.on('cancel', () => inputBox.focus());

ws.on("message", (message) => {
  const packet = JSON.parse(message.toString());

  if (packet.type === "auth_success") {
    username = packet.username;
    chatBox.log(`{green-fg}Successfully logged in as ${username}!{/green-fg}`);
    // Auto-join general room on login
    ws.send(JSON.stringify({ type: "command", command: "join", target: "general" }));
  }
  else if (packet.type === "message") {
    const time = new Date(packet.timestamp).toLocaleTimeString();
    chatBox.log(`{cyan-fg}[${packet.room}] ${packet.username}: ${packet.content} (${time}){/cyan-fg}`);
  }
  else if (packet.type === "system") {
    if (packet.content.includes("joined") && packet.content.startsWith(username)) {
      // It's a join confirmation for us
      currentRoom = packet.content.split("joined ")[1];
      chatBox.setLabel(` User: ${username} | Room: ${currentRoom} `);
    }
    chatBox.log(`{yellow-fg}[SYSTEM] ${packet.content}{/yellow-fg}`);
  }
  else if (packet.type === "dm") {
    const time = new Date(packet.timestamp).toLocaleTimeString();
    chatBox.log(`{magenta-fg}[DM] ${packet.from}: ${packet.content} (${time}){/magenta-fg}`);
  }
  else if (packet.type === "history") {
    chatBox.log(`{gray-fg}--- Chat History ---{/gray-fg}`);
    for (const msg of packet.messages) {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      chatBox.log(`{gray-fg}[${msg.room}] ${msg.username}: ${msg.content} (${time}){/gray-fg}`);
    }
    chatBox.log(`{gray-fg}--- End of History ---{/gray-fg}`);
  }
  else if (packet.type === "rooms_list") {
    chatBox.log(`{cyan-fg}--- Room List ---{/cyan-fg}`);
    for (const r of packet.rooms) {
      chatBox.log(`{green-fg}[${r.name}]{/green-fg} (${r.users} users) - ${r.description}`);
    }
    chatBox.log(`{cyan-fg}-----------------{/cyan-fg}`);
  }
  else if (packet.type === "error") {
    chatBox.log(`{red-fg}[ERROR] ${packet.content}{/red-fg}`);
  }

  screen.render();
});

ws.on("error", (err) => {
  chatBox.log(`{red-fg}${err.message}{/red-fg}`);
  screen.render();
=======
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
>>>>>>> d0911ed8ff905d31466ecdbe262c65348d4af6ab
});
