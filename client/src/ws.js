// src/ws.js

let socket = null; // WebSocket instance
let isConnecting = false; // true while connecting
let messageQueue = []; // queue messages until socket is open
let listeners = []; // message listeners
let statusListeners = []; // connection status listeners
let reconnectInterval = 2000; // reconnect delay in ms

/**
 * Notify all status subscribers
 */
function notifyStatus(status) {
  statusListeners.forEach((fn) => fn(status));
}

/**
 * Initialize WebSocket singleton
 */
export function connect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    notifyStatus('connected');
    return;
  }

  if (isConnecting) return;

  isConnecting = true;
  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = () => {
    console.log('[WS] Connected to server');
    isConnecting = false;
    notifyStatus('connected');

    // flush queued messages
    while (messageQueue.length > 0) {
      const { type, payload } = messageQueue.shift();
      socket.send(JSON.stringify({ type, payload }));
    }
  };

  socket.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      console.error('[WS] Failed to parse message:', event.data, err);
      return;
    }
    listeners.forEach((fn) => fn(msg));
  };

  socket.onclose = (event) => {
    console.warn('[WS] Disconnected', event.reason || '');
    notifyStatus('disconnected');

    isConnecting = false;
    socket = null;

    // attempt reconnect
    setTimeout(connect, reconnectInterval);
  };

  socket.onerror = (err) => {
    console.error('[WS] Error:', err);
    socket.close();
  };
}

/**
 * Send a message
 * Automatically queues if socket not open
 */
export function send(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  } else {
    console.warn('[WS] Socket not open, queuing message:', type, payload);
    messageQueue.push({ type, payload });
  }
}

/**
 * Subscribe to incoming messages
 * @param {Function} fn - receives message object
 * @returns unsubscribe function
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * Subscribe to connection status changes ('connected', 'disconnected')
 * @param {Function} fn
 * @returns unsubscribe function
 */
export function subscribeStatus(fn) {
  statusListeners.push(fn);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}
