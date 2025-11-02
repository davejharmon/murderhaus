// server/utils/Broadcast.js
import { WebSocketServer } from 'ws';

let wss; // singleton

export function getWSS(port = 8080) {
  if (!wss) {
    wss = new WebSocketServer({ port });
    console.log(`[SYSTEM] WebSocket server running on ws://localhost:${port}`);
  }
  return wss;
}

export function broadcast(message) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(message));
  });
}

export function sendTo(ws, message) {
  if (ws.readyState === 1) ws.send(JSON.stringify(message));
}
