import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function logMessage(message) {
  const logDir = path.resolve(__dirname, "../../logs");
  const logFile = path.join(logDir, "chat.log");
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFileSync(logFile, message + "\n");
}