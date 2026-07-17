import { registerUser, verifyUser } from "../services/database.js";
import { createSystemPacket } from "../../../shared/protocol.js";

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

export async function handleLogin(ws, packet, users) {
  if (!packet.username || !packet.password) {
    ws.send(JSON.stringify({ type: "error", content: "Username and password required" }));
    return;
  }

  const success = await verifyUser(packet.username, packet.password);
  if (success) {
    if (users.has(packet.username)) {
      ws.send(JSON.stringify({ type: "error", content: "User is already logged in" }));
      return;
    }

    ws.username = packet.username;
    users.set(ws.username, ws);
    
    ws.send(JSON.stringify({ type: "auth_success", username: packet.username }));
  } else {
    ws.send(JSON.stringify({ type: "error", content: "Invalid username or password" }));
  }
}
