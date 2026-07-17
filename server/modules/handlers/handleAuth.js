import { registerUser, verifyUser } from "../services/database.js";
import { createSystemPacket } from "../../../shared/protocol.js";

/**
 * Handles the registration of a new user.
 * 
 * @param {WebSocket} ws - The client's websocket connection
 * @param {Object} packet - The parsed register packet containing username and password
 */
export async function handleRegister(ws, packet) {
  if (!packet.username || !packet.password) {
    ws.send(JSON.stringify({ type: "error", content: "Username and password required" }));
    return;
  }
  
  const success = await registerUser(packet.username, packet.password);
  if (success) {
    ws.send(JSON.stringify({ type: "system", content: "Registration successful. You can now /login" }));
  } else {
    ws.send(JSON.stringify({ type: "error", content: "Username already exists" }));
  }
}

/**
 * Handles user login and authenticates them.
 * 
 * @param {WebSocket} ws - The client's websocket connection
 * @param {Object} packet - The parsed login packet containing username and password
 * @param {Map} users - Global map of online users to ensure uniqueness
 */
export async function handleLogin(ws, packet, users) {
  if (!packet.username || !packet.password) {
    ws.send(JSON.stringify({ type: "error", content: "Username and password required" }));
    return;
  }

  const success = await verifyUser(packet.username, packet.password);
  if (success) {
    // Check if the user is already logged in elsewhere
    if (users.has(packet.username)) {
      ws.send(JSON.stringify({ type: "error", content: "User is already logged in" }));
      return;
    }

    // Set the user's session properties
    ws.username = packet.username;
    users.set(ws.username, ws);
    
    // Notify the client of successful authentication
    ws.send(JSON.stringify({ type: "auth_success", username: packet.username }));
  } else {
    // Incorrect password or non-existent username
    ws.send(JSON.stringify({ type: "error", content: "Invalid username or password" }));
  }
}
