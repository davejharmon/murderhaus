// src/ws.js

let socket = null;
let messageQueue = [];
let listeners = [];
let statusListeners = [];
let isConnecting = false;
const reconnectInterval = 2000;

// Determine WebSocket URL
const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:8080'
  : `${window.location.origin.replace(/^http/, 'ws')}`;

// Notify all status listeners
function notifyStatus(status) {
  statusListeners.forEach((fn) => fn(status));
  console.log('[WS STATUS]', status);
}

// Initialize WebSocket connection
function initSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    notifyStatus(
      socket.readyState === WebSocket.OPEN ? 'connected' : 'connecting'
    );
    return;
  }

  isConnecting = true;
  notifyStatus('connecting');

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    isConnecting = false;
    notifyStatus('connected');
    console.log('[WS] Connected');

    // Flush queued messages
    while (messageQueue.length) {
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

  socket.onclose = () => {
    console.warn('[WS] Disconnected');
    notifyStatus('disconnected');
    socket = null;
    isConnecting = false;
    setTimeout(initSocket, reconnectInterval);
  };

  socket.onerror = (err) => {
    console.error('[WS] Error:', err);
    if (socket) socket.close();
  };
}

// Automatically start connecting
initSocket();

/**
 * Ensure the socket is connected.
 * Returns a Promise that resolves once the connection is open.
 */
export function ensureConnected() {
  return new Promise((resolve) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      resolve();
    } else {
      const unsub = subscribeStatus((status) => {
        if (status === 'connected') {
          resolve();
          unsub();
        }
      });

      // Trigger init if socket is closed
      if (!socket && !isConnecting) initSocket();
    }
  });
}

/**
 * Send a message; queue if socket not ready.
 */
export function send(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  } else {
    messageQueue.push({ type, payload });
    if (!isConnecting) initSocket();
  }
}

/**
 * Subscribe to incoming messages
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * Subscribe to WebSocket status changes
 */
export function subscribeStatus(fn) {
  statusListeners.push(fn);

  // Immediately call with current status
  let currentStatus = 'disconnected';
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) currentStatus = 'connected';
    else if (socket.readyState === WebSocket.CONNECTING)
      currentStatus = 'connecting';
  } else if (isConnecting) {
    currentStatus = 'connecting';
  }
  fn(currentStatus);

  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

/**
 * Get current socket readyState
 */
export function getSocketReadyState() {
  return socket ? socket.readyState : WebSocket.CLOSED;
}
