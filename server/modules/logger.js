import fs from "fs";


export function logMessage(message) {

    fs.appendFileSync(
        "../logs/chat.log",
        `[${Date.now()}]:${message}\n`
    );

}