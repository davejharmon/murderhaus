// server/utils/Broadcast.js
import { WebSocketServer, WebSocket } from 'ws';

let wss; // singleton

export function getWSS(port = 8080) {
  if (!wss) {
    wss = new WebSocketServer({ port });
    console.log(`[SYSTEM] WebSocket server running on ws://localhost:${port}`);
  }
  return wss;
}

/**
 * Broadcast a message to all connected clients
 * @param {any} message
 * @param {WebSocket} exclude - optional client to skip
 */
export function broadcast(message, exclude) {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(JSON.stringify(message));
    }
  });
}

/**
 * Send a message to a single client
 * @param {WebSocket} ws
 * @param {any} message
 */
export function sendTo(ws, message) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}
