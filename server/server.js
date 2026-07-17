import { WebSocketServer } from "ws";

import { validatePacket } from "../shared/validator.js";

import { handleRegister, handleLogin } from "./modules/handlers/handleAuth.js";

import { handleMessage } from "./modules/handlers/handleMessage.js";

import { handleCommand } from "./modules/handlers/handleCmd.js";

import { createSystemPacket } from "../shared/protocol.js";

import { broadcastToRoom } from "./modules/services/broadcast.js";
import { config } from "../shared/config.js";

// Initialize WebSocket server using configured port
const wss = new WebSocketServer({
    port: config.network.port,
});

// In-memory stores for active users and rooms
const users = new Map();
const rooms = new Map();
// Pre-create general room as configured
rooms.set(config.defaults.defaultRoom, { users: new Set(), description: "General discussion" });

// Map packet types to their respective handler functions
const handlers = {
    register: handleRegister,
    login: handleLogin,
    message: handleMessage,
    command: handleCommand,
};

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Initialize client session state
    ws.username = null;
    ws.room = null;

    // Handle incoming messages from the client
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

        // Route the packet to the appropriate handler
        handler(ws, packet, users, rooms);
    });

    // Handle client disconnection
    ws.on("close", () => {
        if (ws.username) {
            // Remove user from global active users map
            users.delete(ws.username);

            // Remove user from their current room
            if (ws.room && rooms.has(ws.room)) {
                rooms.get(ws.room).users.delete(ws);

                // Broadcast departure message to the room
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
