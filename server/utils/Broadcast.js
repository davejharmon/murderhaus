import { WebSocketServer, WebSocket } from 'ws';
import { CHANNELS } from '../../shared/constants/index.js';

let wss; // singleton
const subscriptions = new Map(); // Map<string, Set<WebSocket>>

export function getWSS(port = 8080) {
  if (!wss) {
    wss = new WebSocketServer({ port });
    console.log(`[SYSTEM] WebSocket server running on ws://localhost:${port}`);

    wss.on('connection', (ws) => {
      // When a client disconnects, clean them from all subscriptions
      ws.on('close', () => {
        for (const subs of subscriptions.values()) {
          subs.delete(ws);
        }
      });
    });
  }
  return wss;
}

/**
 * Subscribe a client to a specific channel
 */
export function subscribe(ws, channel) {
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Set());
  }
  subscriptions.get(channel).add(ws);
}

/**
 * Publish a message to all clients subscribed to a channel
 */
export function publish(channel, payload) {
  const subs = subscriptions.get(channel);
  if (!subs) return;

  const msg = JSON.stringify({ type: channel, payload });
  subs.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

/**
 * Send directly to one client
 */
export function sendTo(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Broadcast to ALL clients (less useful but still available)
 */
export function broadcast(message, exclude) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(JSON.stringify(message));
    }
  });
}

// Optional helper: subscribe a WS to all main game channels
export function subscribeAllMain(ws) {
  Object.values(CHANNELS).forEach((ch) => subscribe(ws, ch));
}
