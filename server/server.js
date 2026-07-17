import { WebSocketServer } from "ws";

import { validatePacket } from "../shared/validator.js";

import { handleRegister, handleLogin } from "./modules/handlers/handleAuth.js";

import { handleMessage } from "./modules/handlers/handleMessage.js";

import { handleCommand } from "./modules/handlers/handleCmd.js";

import { createSystemPacket } from "../shared/protocol.js";

import { broadcastToRoom } from "./modules/services/broadcast.js";

const wss = new WebSocketServer({
    port: 5051,
});

const users = new Map();
const rooms = new Map();
// Pre-create general room
rooms.set("general", { users: new Set(), description: "General discussion" });

const handlers = {
    register: handleRegister,
    login: handleLogin,
    message: handleMessage,
    command: handleCommand,
};

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.username = null;
    ws.room = null;

    ws.on("message", (message) => {
        const packet = JSON.parse(message.toString());

        if (!validatePacket(packet)) {
            console.log("Invalid packet");

            return;
        }

        const handler = handlers[packet.type];

        if (!handler) {
            console.log("Unknown packet type");

            return;
        }

        handler(ws, packet, users, rooms);
    });

    ws.on("close", () => {
        if (ws.username) {
            users.delete(ws.username);

            if (ws.room && rooms.has(ws.room)) {
                rooms.get(ws.room).users.delete(ws);

                const systemPacket = createSystemPacket(
                    `${ws.username} left ${ws.room}`,
                );
                broadcastToRoom(ws.room, rooms, systemPacket);
            }
        }

        console.log("Client disconnected");
    });
});

console.log("Wire server running");
